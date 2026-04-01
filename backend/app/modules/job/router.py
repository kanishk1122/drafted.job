from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.job.service import job_service
from app.modules.job.model import JobStatus
from app.modules.job.schema import JobSchema, JobMetricsSchema
from app.modules.user.model import UserContext
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[JobSchema])
def list_jobs(
    status: Optional[JobStatus] = None, 
    limit: int = 50, 
    offset: int = 0, 
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Retrieve professional job vault with performance sorting and user-context isolation.
    """
    return job_service.list_jobs(db, current_user.id, status, limit, offset)

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

@router.get("/metrics", response_model=JobMetricsSchema)
def get_job_metrics(
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Analyze job search performance metrics and success rates for the authenticated user.
    """
    return job_service.get_job_metrics(db, current_user.id)
