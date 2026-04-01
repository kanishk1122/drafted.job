import asyncio
import sys

# Import this FIRST to set loop policy before anything else
import uvicorn_startup  # This sets ProactorEventLoop on Windows

if sys.platform == 'win32':
    print("🔧 Setting ProactorEventLoopPolicy for Windows subprocess support...")
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from database import get_db, Job, JobStatus, Profile
from fastapi.middleware.cors import CORSMiddleware
# Import agent AFTER setting loop policy
from agent import run_job_search
from simple_login import run_interactive_login_simple

app = FastAPI(title="JobHuntr Suite API")

@app.on_event("startup")
async def startup_event():
    import sys
    loop = asyncio.get_running_loop()
    print(f"🚀 FastAPI started. Event loop type: {type(loop)}")
    if sys.platform == 'win32' and not isinstance(loop, asyncio.ProactorEventLoop):
        print("🚨 WARNING: Not using ProactorEventLoop. Browser launch WILL fail.")
        print("👉 Please run with: python main.py")
        print("   OR: uvicorn main:app --loop asyncio --reload --port 5000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobSearchRequest(BaseModel):
    query: str
    headless: Optional[bool] = True
    platforms: Optional[List[str]] = []

class StatsResponse(BaseModel):
    collected: int
    submitted: int
    interviews: int

class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str
    status: str
    match_score: int
    reasoning_want: Optional[str] = None
    reasoning_fit: Optional[str] = None
    platform: Optional[str] = None
    run_id: Optional[str] = None
    created_at: str

@app.post("/search-jobs")
async def search_jobs(request: JobSearchRequest, background_tasks: BackgroundTasks):
    import uuid
    run_id = str(uuid.uuid4())
    background_tasks.add_task(run_job_search, request.query, request.headless, request.platforms)
    return {"status": "started", "run_id": run_id, "message": "Agent deployed! Processing jobs in the background."}

@app.get("/stats", response_model=StatsResponse)
async def get_stats(db: Session = Depends(get_db)):
    collected = db.query(Job).count()
    submitted = db.query(Job).filter(Job.status == JobStatus.APPLIED).count()
    interviews = db.query(Job).filter(Job.status == JobStatus.INTERVIEWING).count()
    return {"collected": collected, "submitted": submitted, "interviews": interviews}

@app.get("/jobs", response_model=List[JobResponse])
async def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    return [{
        "id": j.id,
        "title": j.title,
        "company": j.company,
        "location": j.location,
        "status": j.status.value,
        "match_score": j.match_score,
        "reasoning_want": j.reasoning_want,
        "reasoning_fit": j.reasoning_fit,
        "platform": j.platform,
        "run_id": j.run_id,
        "created_at": j.created_at.strftime("%b %d, %Y")
    } for j in jobs]

@app.get("/queue", response_model=List[JobResponse])
async def get_queue(db: Session = Depends(get_db)):
    # Fetch jobs that are in 'FOUND' or 'QUEUED' status for the submission queue
    jobs = db.query(Job).filter(Job.status.in_([JobStatus.QUEUED, JobStatus.FOUND])).order_by(Job.created_at.desc()).all()
    return [{
        "id": j.id,
        "title": j.title,
        "company": j.company,
        "location": j.location,
        "status": j.status.value,
        "match_score": j.match_score,
        "reasoning_want": j.reasoning_want,
        "reasoning_fit": j.reasoning_fit,
        "platform": j.platform,
        "run_id": j.run_id,
        "created_at": j.created_at.strftime("%b %d, %Y")
    } for j in jobs]

@app.patch("/jobs/{job_id}/status")
async def update_job_status(job_id: int, status: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        job.status = JobStatus(status)
        db.commit()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    return {"status": "ok", "new_status": job.status}

@app.delete("/jobs/{job_id}")
async def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if job:
        db.delete(job)
        db.commit()
    return {"status": "ok"}

@app.post("/connect-platform/{platform_id}")
async def connect_platform(platform_id: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_interactive_login_simple, platform_id)
    return {"status": "started", "message": f"Interactive login for {platform_id} initiated."}

@app.get("/platform-status")
async def get_platform_status(db: Session = Depends(get_db)):
    from database import PlatformConnection
    conns = db.query(PlatformConnection).all()
    return {c.platform_id: {"is_connected": bool(c.is_connected), "last_login": c.last_login} for c in conns}

if __name__ == "__main__":
    import uvicorn
    # Use string reference and reload=True for development.
    # We specify loop="asyncio" to ensure it uses the default asyncio loop,
    # which we have configured to be Proactor at the top of this file.
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True, loop="asyncio")
