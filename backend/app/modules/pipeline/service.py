from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.modules.job.model import JobRepository, JobStatus
from app.modules.pipeline.schema import DashboardStats, PipelineStat, ActivityChartData, ActivityPoint

class PipelineService:
    def get_dashboard_stats(self, db: Session, user_id: int):
        """
        Aggregate professional career metrics from the recruitment repository for a specific user.
        """
        # Base query filtered by user_id
        user_query = db.query(JobRepository).filter(JobRepository.user_id == user_id)
        
        total_discovered = user_query.count()
        applied = user_query.filter(JobRepository.status == JobStatus.APPLIED).count()
        positive = user_query.filter(JobRepository.status == JobStatus.OFFER).count()
        interviews = user_query.filter(JobRepository.status == JobStatus.INTERVIEW).count()
        
        # Calculate activity chart data for the last 7 days
        activity_points = []
        for i in range(6, -1, -1):
            date = (datetime.utcnow() - timedelta(days=i)).date()
            count = user_query.filter(func.date(JobRepository.created_at) == date).count()
            activity_points.append({
                "date": date.strftime("%a"), # Mon, Tue...
                "count": count
            })

        return {
            "jobs_discovered": {
                "value": f"{total_discovered:,}",
                "change": "+12% from last week",
                "label": "Jobs Discovered"
            },
            "forms_submitted": {
                "value": f"{applied:,}",
                "change": "+18% from last week",
                "label": "Forms Submitted"
            },
            "positive_responses": {
                "value": f"{positive:,}",
                "change": "+2% from last week",
                "label": "Positive Responses"
            },
            "interviews_done": {
                "value": f"{interviews:02d}",
                "change": "Active Operations",
                "label": "Interviews Done"
            },
            "activity_chart": {
                "points": activity_points
            }
        }

pipeline_service = PipelineService()
