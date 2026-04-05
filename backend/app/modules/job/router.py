from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.job.service import job_service
from app.modules.job.model import JobStatus
from app.modules.job.schema import JobSchema, JobSummarySchema, JobMetricsSchema, JobCreateSchema
from app.modules.user.model import UserContext
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[JobSummarySchema])
def list_jobs(
    status: Optional[JobStatus] = None, 
    platform: Optional[str] = None,
    min_score: int = 0,
    q: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    sort_by: str = "newest",
    limit: int = 50, 
    offset: int = 0, 
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Retrieve lightweight job summaries for list/kanban views.
    Only returns essential fields — no description, tech_stack, or match_reason.
    """
    return job_service.list_jobs(db, current_user.id, status, platform, min_score, q, start_date, end_date, sort_by, limit, offset)

@router.post("/", response_model=JobSchema)
def create_manual_job(
    job_data: JobCreateSchema,
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Manually inject a mission-critical position into the private vault.
    Allows for high-fidelity tracking of non-automated scouting results.
    """
    return job_service.create_manual_job(db, current_user.id, job_data)

@router.get("/metrics", response_model=JobMetricsSchema)
def get_job_metrics(
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Analyze job search performance metrics and success rates for the authenticated user.
    """
    return job_service.get_job_metrics(db, current_user.id)

@router.get("/{job_id}", response_model=JobSchema)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Retrieve complete job details for a specific position.
    Called when user selects a job from the list.
    """
    job = job_service.get_job_by_id(db, current_user.id, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.patch("/{job_id}/status")
def update_job_status(
    job_id: int, 
    status: JobStatus, 
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Transition a job record through the career pipeline stages within the user's private vault.
    """
    return job_service.update_job_status(db, current_user.id, job_id, status)

@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Surgically remove a mission record from the private vault.
    """
    return job_service.delete_job(db, current_user.id, job_id)
