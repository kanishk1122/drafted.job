from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class ScoutSession(Base):
    """Represents one AI job scouting run with results summary."""
    __tablename__ = "scout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_contexts.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)          # e.g. "Full Stack Dev · linkedin"
    target_role = Column(String(255), nullable=False)
    location = Column(String(255))
    platform = Column(String(50), nullable=False)
    status = Column(String(20), default="running")      # running | completed | failed
    error_msg = Column(Text, nullable=True)
    total_jobs = Column(Integer, default=0)
    # JSON array: [{"platform": "LinkedIn", "logo": "...", "count": 5}]
    breakdown = Column(JSON, default=list)
    # Industrial Synchronization Pulse: Unique ID for the active Python task
    current_task_id = Column(String(50), nullable=True)
    # Mission Continuity Hub: Tracks exactly where the AI stopped before hibernation or hijacking
    current_platform = Column(String(50), nullable=True) # last processed platform
    current_page = Column(Integer, default=1)           # last processed page
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
