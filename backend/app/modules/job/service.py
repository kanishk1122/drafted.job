from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.job.model import JobRepository, JobStatus
from app.modules.job.schema import JobCreateSchema
from typing import Optional

class JobService:
    def create_manual_job(self, db: Session, user_id: int, job_data: JobCreateSchema):
        job = JobRepository(
            user_id=user_id,
            title=job_data.title,
            company=job_data.company,
            platform=job_data.platform,
            location=job_data.location,
            url=job_data.url,
            status=job_data.status,
            heuristic_score=job_data.heuristic_score,
            description=job_data.description,
            tech_stack=job_data.tech_stack
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job
    def list_jobs(self, db: Session, user_id: int, status: Optional[JobStatus] = None, platform: Optional[str] = None, min_score: Optional[int] = 0, sort_by: str = "newest", limit: int = 50, offset: int = 0):
        query = db.query(JobRepository).filter(JobRepository.user_id == user_id)
        
        if status:
            query = query.filter(JobRepository.status == status)
        if platform and platform.lower() != "all":
            query = query.filter(JobRepository.platform.ilike(platform))
        if min_score:
            query = query.filter(JobRepository.heuristic_score >= min_score)
        
        if sort_by == "score":
            query = query.order_by(JobRepository.heuristic_score.desc())
        else:
            query = query.order_by(JobRepository.created_at.desc())
            
        return query.limit(limit).offset(offset).all()

    def update_job_status(self, db: Session, user_id: int, job_id: int, status: JobStatus):
        job = db.query(JobRepository).filter(JobRepository.id == job_id, JobRepository.user_id == user_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found in your vault")
        
        job.status = status
        db.commit()
        db.refresh(job)
        return job

    def get_job_by_id(self, db: Session, user_id: int, job_id: int):
        """Fetch complete job details — called only when user selects a specific job."""
        return db.query(JobRepository).filter(
            JobRepository.id == job_id,
            JobRepository.user_id == user_id
        ).first()


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
