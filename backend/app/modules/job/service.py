from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.job.model import JobRepository, JobStatus
from typing import Optional

class JobService:
    def list_jobs(self, db: Session, user_id: int, status: Optional[JobStatus] = None, limit: int = 50, offset: int = 0):
        query = db.query(JobRepository).filter(JobRepository.user_id == user_id)
        if status:
            query = query.filter(JobRepository.status == status)
        
        return query.order_by(JobRepository.heuristic_score.desc()).limit(limit).offset(offset).all()

    def update_job_status(self, db: Session, user_id: int, job_id: int, status: JobStatus):
        job = db.query(JobRepository).filter(JobRepository.id == job_id, JobRepository.user_id == user_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found in your vault")
        
        job.status = status
        db.commit()
        db.refresh(job)
        return job

    def get_job_metrics(self, db: Session, user_id: int):
        user_query = db.query(JobRepository).filter(JobRepository.user_id == user_id)
        total = user_query.count()
        matches = user_query.filter(JobRepository.heuristic_score > 80).count()
        applied = user_query.filter(JobRepository.status == JobStatus.APPLIED).count()
        interviews = user_query.filter(JobRepository.status == JobStatus.INTERVIEW).count()
        
        return {
            "total_scouted": total,
            "heuristic_matches": matches,
            "manual_apps": applied,
            "interviews": interviews
        }

job_service = JobService()
