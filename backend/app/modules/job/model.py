from enum import Enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from app.core.database import Base

class JobStatus(str, Enum):
    NEW = "New"
    SAVED = "Saved"
    APPLIED = "Applied"
    IGNORED = "Ignored"
    INTERVIEW = "Interview"
    OFFER = "Offer"

class JobRepository(Base):
    __tablename__ = "job_repository"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_contexts.id"))
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255))
    description = Column(Text)
    url = Column(String(1000), unique=True, index=True)
    platform = Column(String(50))
    salary = Column(String(100))
    
    # Heuristic match fields
    heuristic_score = Column(Integer, default=0)
    match_reason = Column(Text)
    
    status = Column(SQLEnum(JobStatus), default=JobStatus.NEW)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
