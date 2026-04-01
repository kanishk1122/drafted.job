from fastapi import APIRouter, HTTPException, Depends, Request
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

async def _scout_generator(request: Request, user_email: str, platform: str, target_role: str, location: str, db: Session):
    from app.modules.user.model import UserContext
    user = db.query(UserContext).filter(UserContext.email == user_email).first()
    if not user:
        yield {"data": '{"type": "error", "message": "User not found"}'}
        return

    from app.modules.resume.model import Resume
    import json

    resume = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.created_at.desc()).first()
    
    # Industrial Identity Pivot: Prefer Resume data over generic user data
    skills = ""
    summary = ""
    experience_text = ""
    
    if resume:
        # Skills
        if resume.skills:
            try:
                skills_list = json.loads(resume.skills)
                skills = ", ".join(skills_list)
            except:
                skills = str(resume.skills)
        
        # Summary
        summary = resume.summary or ""
        
        # Experience (Stringify the list)
        if resume.experience:
            try:
                exp_list = json.loads(resume.experience)
                experience_text = "\n".join([f"{e.get('role')} at {e.get('company')}: {e.get('description')}" for e in exp_list])
            except:
                experience_text = str(resume.experience)
    else:
        skills = user.skills or target_role

    # Industrial Neural Step: Perfect the search query based on professional narrative
    from app.modules.ai.service import ai_service
    yield json.dumps({"type": "thinking", "message": f"🧠 AI is distilling mission intent from profile data..."})
    refined_query = await ai_service.refine_search_query(target_role, skills, experience_text)
    yield json.dumps({"type": "thinking", "message": f"🎯 Search Directive Refined: '{refined_query}'"})

    async for event_data in job_scout_service.run_search(
        user_id=user.id,
        user_email=user_email,
        platform=platform,
        target_role=refined_query, # Use the high-fidelity AI-refined query
        location=location,
        skills=skills,
        db=db,
        summary=summary,
        experience=experience_text
    ):
        if await request.is_disconnected():
            print(f"🛑 Client disconnected. Aborting session for {user_email}")
            break
        yield {"data": event_data}
        await asyncio.sleep(0)

@router.get("/scout")
async def scout_jobs(
    request: Request,
    user_id: str,
    platform: str,
    target_role: str,
    location: str = "India",
    db: Session = Depends(get_db)
):
    """
    SSE stream: Real-time AI thoughts + job matches scraped from local Chrome.
    """
    return EventSourceResponse(_scout_generator(request, user_id, platform, target_role, location, db))

@router.delete("/sessions/{session_id}")
async def delete_scout_session(session_id: int, user_id: str, db: Session = Depends(get_db)):
    """Remove a scout session from history. Optimized to return minimal success flag."""
    from app.modules.user.model import UserContext
    from app.modules.browser.session_model import ScoutSession

    user = db.query(UserContext).filter(UserContext.email == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session = db.query(ScoutSession).filter(ScoutSession.id == session_id, ScoutSession.user_id == user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session records not found or mission already purged")

    db.delete(session)
    db.commit()
    
    return {"success": True}

