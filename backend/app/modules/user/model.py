from sqlalchemy import Column, Integer, String, Text, Float, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserContext(Base):
    __tablename__ = "user_contexts"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    target_roles = Column(Text)  # Comma-separated or JSON
    skills = Column(Text)        # Comma-separated or JSON
    salary_floor = Column(Float)
    years_of_experience = Column(Float, default=0.0)
    resume_text = Column(Text)
    
    # Platform status and credentials
    linkedin_email = Column(String(255))
    linkedin_active = Column(Boolean, default=False)
    naukri_email = Column(String(255))
    naukri_active = Column(Boolean, default=False)
    indeed_email = Column(String(255))
    indeed_active = Column(Boolean, default=False)
    instahyre_email = Column(String(255))
    instahyre_active = Column(Boolean, default=False)
    foundit_active = Column(Boolean, default=False)
    glassdoor_active = Column(Boolean, default=False)
    ambitionbox_active = Column(Boolean, default=False)
    google_email = Column(String(255))
    google_active = Column(Boolean, default=False)

    resumes = relationship("Resume", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
