from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os
import asyncio
from sqlalchemy.orm import Session
from app.modules.browser.service import browser_service
from app.core.dependencies import get_db

router = APIRouter()

class ProfileStatus(BaseModel):
    user_id: str

@router.get("/{user_id}/status")
async def get_profile_status(user_id: str):
    path = browser_service.get_user_profile_path(user_id)
    exists = os.path.exists(path)
    return {"user_id": user_id, "profile_path": path, "stored": exists}

@router.get("/sessions")
async def get_scout_sessions(user_id: str, db: Session = Depends(get_db)):
    """Return the user's scout session history from the database."""
    from app.modules.user.model import UserContext
    from app.modules.browser.session_model import ScoutSession

    user = db.query(UserContext).filter(UserContext.email == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    sessions = (
        db.query(ScoutSession)
        .filter(ScoutSession.user_id == user.id)
        .order_by(ScoutSession.created_at.desc())
        .limit(50)
        .all()
    )

    def fmt_date(dt):
        if not dt: return "Unknown"
        import datetime
        now = datetime.datetime.now(dt.tzinfo)
        diff = now - dt
        if diff.days == 0:
            return f"Today, {dt.strftime('%I:%M %p')}"
        elif diff.days == 1:
            return f"Yesterday, {dt.strftime('%I:%M %p')}"
        else:
            return dt.strftime("%b %d, %I:%M %p")

    return [
        {
            "id": s.id,
            "name": s.name,
            "status": s.status,
            "error": s.error_msg,
            "date": fmt_date(s.created_at),
            "totalJobs": s.total_jobs or 0,
            "breakdown": s.breakdown or [],
        }
        for s in sessions
    ]

@router.post("/check-session")
async def check_session(user_id: str, platform: str, db: Session = Depends(get_db)):
    """
    Checks if a user is logged into a given platform on their local Chrome.
    If success, updates the database status.
    """
    from app.modules.user.model import UserContext
    try:
        is_active = await browser_service.check_platform_session(platform.lower())
        
        if is_active:
            user = db.query(UserContext).filter(UserContext.email == user_id).first()
            if user:
                field_name = f"{platform.lower()}_active"
                if hasattr(user, field_name):
                    setattr(user, field_name, True)
                    db.commit()
                    print(f"✅ DB Updated: {user_id} -> {platform} is now ACTIVE")

        return {
            "user_id": user_id,
            "platform": platform,
            "active": is_active
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# SSE Scout Endpoint
from sse_starlette.sse import EventSourceResponse
from app.modules.browser.scout import job_scout_service

async def _scout_generator(user_email: str, platform: str, target_role: str, location: str, db: Session):
    from app.modules.user.model import UserContext
    user = db.query(UserContext).filter(UserContext.email == user_email).first()
    if not user:
        yield {"data": '{"type": "error", "message": "User not found"}'}
        return

    skills = user.skills or target_role

    async for event_data in job_scout_service.run_search(
        user_id=user.id,
        user_email=user_email,
        platform=platform,
        target_role=target_role,
        location=location,
        skills=skills,
        db=db,
    ):
        yield {"data": event_data}
        await asyncio.sleep(0)

@router.get("/scout")
async def scout_jobs(
    user_id: str,
    platform: str,
    target_role: str,
    location: str = "India",
    db: Session = Depends(get_db)
):
    """
    SSE stream: Real-time AI thoughts + job matches scraped from local Chrome.
    """
    return EventSourceResponse(_scout_generator(user_id, platform, target_role, location, db))
