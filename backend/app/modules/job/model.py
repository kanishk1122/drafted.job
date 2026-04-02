from enum import Enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class JobStatus(str, Enum):
    NEW = "new"
    POTENTIAL = "potential"
    CANDIDATE = "candidate"
    APPLIED = "applied"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"
    SAVED = "saved"
    IGNORED = "ignored"

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
    currency = Column(String(20)) # e.g. USD, INR
    tech_stack = Column(Text) # JSON serialized list of skills
    
    # Heuristic match fields
    heuristic_score = Column(Integer, default=0)
    match_reason = Column(Text)
    
    status = Column(SQLEnum(JobStatus), default=JobStatus.NEW)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
