from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.job.model import JobRepository, JobStatus
from app.modules.job.schema import JobCreateSchema
from typing import Optional
from app.core.redis import cached, cache

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
        
        # INDUSTRIAL INVALIDATION: Force metrics refresh
        self._clear_user_caches(user_id)
        return job

    def save_scouted_job(self, db: Session, user_id: int, data: dict):
        """Clinical entry point for AI scout missions."""
        job = JobRepository(
            user_id=user_id,
            title=data.get("title"),
            company=data.get("company"),
            location=data.get("location"),
            url=data.get("url"),
            platform=data.get("platform"),
            description=data.get("description"),
            salary=data.get("salary"),
            currency=data.get("currency"),
            tech_stack=data.get("tech_stack"),
            heuristic_score=data.get("heuristic_score"),
            match_reason=data.get("match_reason"),
            status=JobStatus.NEW
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # INDUSTRIAL INVALIDATION
        self._clear_user_caches(user_id)
        return job
        
    @cached(expire_seconds=900, key_prefix="jobs_list")
    def list_jobs(self, db: Session, user_id: int, status: Optional[JobStatus] = None, platform: Optional[str] = None, min_score: Optional[int] = 0, q: Optional[str] = None, start_date: Optional[str] = None, end_date: Optional[str] = None, sort_by: str = "newest", limit: int = 50, offset: int = 0):
        query = db.query(JobRepository).filter(
            JobRepository.user_id == user_id,
            JobRepository.is_active == True
        )
        
        if q:
            from sqlalchemy import or_
            query = query.filter(or_(
                JobRepository.title.ilike(f"%{q}%"),
                JobRepository.company.ilike(f"%{q}%"),
                JobRepository.location.ilike(f"%{q}%")
            ))
        
        if status:
            query = query.filter(JobRepository.status == status)
        if platform and platform.lower() != "all":
            query = query.filter(JobRepository.platform.ilike(platform))
        if min_score:
            query = query.filter(JobRepository.heuristic_score >= min_score)
        
        if start_date:
            from datetime import datetime
            try:
                dt_start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                query = query.filter(JobRepository.created_at >= dt_start)
            except (ValueError, TypeError):
                pass
        
        if end_date:
            from datetime import datetime
            try:
                dt_end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                query = query.filter(JobRepository.created_at <= dt_end)
            except (ValueError, TypeError):
                pass
        
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
        
        # INDUSTRIAL INVALIDATION
        self._clear_user_caches(user_id)
        return job

    def get_job_by_id(self, db: Session, user_id: int, job_id: int):
        """Fetch complete job details — called only when user selects a specific job."""
        return db.query(JobRepository).filter(
            JobRepository.id == job_id,
            JobRepository.user_id == user_id
        ).first()

    @cached(expire_seconds=300, key_prefix="metrics")
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

    def delete_job(self, db: Session, user_id: int, job_id: int):
        """Surgically deactivate a mission record in the private vault."""
        job = db.query(JobRepository).filter(
            JobRepository.id == job_id,
            JobRepository.user_id == user_id
        ).first()
        
        if not job:
            raise HTTPException(status_code=404, detail="Job record not found")
        
        job.is_active = False
        db.commit()
        
        # INDUSTRIAL INVALIDATION
        self._clear_user_caches(user_id)
        return {"status": "success", "id": job_id}

    def _clear_user_caches(self, user_id: int):
        """Industrial Pulse: Purge all caches related to this user's job telemetry."""
        cache.clear_pattern(f"metrics:get_job_metrics:{user_id}:*")
        cache.clear_pattern(f"jobs_list:list_jobs:{user_id}:*")

job_service = JobService()
