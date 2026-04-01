from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_contexts.id"))
    filename = Column(String(255))
    file_type = Column(String(50)) # pdf, docx, etc.
    raw_text = Column(Text)
    
    # Extracted data in separate columns
    full_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    location = Column(String(255))
    summary = Column(Text)
    skills = Column(Text)       # JSON string or comma-separated
    experience = Column(Text)   # JSON string
    education = Column(Text)    # JSON string
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("UserContext", back_populates="resumes")

# Update UserContext to have a relationship with Resume
# (Already in model.py, I will add it there in a next step)
