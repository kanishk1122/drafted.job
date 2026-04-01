from pydantic import BaseModel
from typing import List

class UserBioRequest(BaseModel):
    message: str

class ExtractedInfo(BaseModel):
    role: str
    experience_years: int
    skills: List[str]
    primary_goal: str
    summary: str
