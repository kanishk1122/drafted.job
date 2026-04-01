from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime

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

class JobSummarySchema(BaseModel):
    """Lightweight schema for list views — no heavy text fields."""
    id: int
    title: str
    company: str
    platform: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    heuristic_score: Optional[int] = 0
    status: JobStatus = JobStatus.NEW
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JobSchema(BaseModel):
    id: int
    user_id: int
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    url: str
    platform: Optional[str] = None
    salary: Optional[str] = None
    currency: Optional[str] = None
    tech_stack: Optional[str] = None
    heuristic_score: Optional[int] = 0
    match_reason: Optional[str] = None
    status: JobStatus = JobStatus.NEW
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JobMetricsSchema(BaseModel):
    total_scouted: int
    heuristic_matches: int
    manual_apps: int
    interviews: int

class JobCreateSchema(BaseModel):
    title: str
    company: str
    platform: str = "Manual"
    location: Optional[str] = None
    url: Optional[str] = ""
    status: str = "applied"
    heuristic_score: int = 85
    description: Optional[str] = None
    tech_stack: Optional[str] = None

