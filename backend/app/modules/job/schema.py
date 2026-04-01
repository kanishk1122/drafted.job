from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class JobStatus(str, Enum):
    NEW = "new"
    POTENTIAL = "potential"
    CANDIDATE = "candidate"
    APPLIED = "applied"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"

class JobSchema(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    url: str
    platform: Optional[str] = None
    salary: Optional[str] = None
    heuristic_score: Optional[int] = 0
    match_reason: Optional[str] = None
    status: JobStatus = JobStatus.NEW

    class Config:
        from_attributes = True

class JobMetricsSchema(BaseModel):
    total_scouted: int
    heuristic_matches: int
    manual_apps: int
    interviews: int
