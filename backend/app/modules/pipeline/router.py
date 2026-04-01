from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.pipeline.service import pipeline_service
from app.modules.pipeline.schema import DashboardStats
from app.modules.user.model import UserContext

router = APIRouter()

@router.get("/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Retrieve professional-grade aggregated performance metrics for the career command center. This includes
    the activity chart data based on the user's job search timeline.
    """
    return pipeline_service.get_dashboard_stats(db, current_user.id)
