from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    full_name: str
    email: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    target_roles: Optional[str] = None
    skills: Optional[str] = None
    salary_floor: Optional[float] = None
    linkedin_email: Optional[str] = None
    linkedin_active: Optional[bool] = None
    naukri_email: Optional[str] = None
    naukri_active: Optional[bool] = None
    indeed_email: Optional[str] = None
    indeed_active: Optional[bool] = None
    instahyre_email: Optional[str] = None
    instahyre_active: Optional[bool] = None
    foundit_active: Optional[bool] = None
    glassdoor_active: Optional[bool] = None
    ambitionbox_active: Optional[bool] = None
