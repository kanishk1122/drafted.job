from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import enum

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(os.path.dirname(BASE_DIR), 'job_hunter.db')}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class JobStatus(str, enum.Enum):
    FOUND = "Found"
    QUEUED = "Queued" # Ready for application
    INTERESTED = "Interested"
    APPLIED = "Applied"
    INTERVIEWING = "Interviewing"
    OFFERED = "Offered"
    REJECTED = "Rejected"
    ARCHIVED = "Archived"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String, index=True)
    location = Column(String)
    salary = Column(String, nullable=True)
    source_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(Enum(JobStatus), default=JobStatus.FOUND)
    match_score = Column(Integer, default=0)
    reasoning_want = Column(Text, nullable=True)
    reasoning_fit = Column(Text, nullable=True)
    platform = Column(String, nullable=True) # e.g., 'LinkedIn', 'Indeed'
    run_id = Column(String, nullable=True) # for grouping jobs by a specific search session
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String)
    phone = Column(String)
    resume_text = Column(Text)
    portfolio_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    
    # Credentials for secure automation
    naukri_email = Column(String, nullable=True)
    naukri_pass = Column(String, nullable=True)
    linkedin_email = Column(String, nullable=True)
    linkedin_pass = Column(String, nullable=True)
    indeed_email = Column(String, nullable=True)
    indeed_pass = Column(String, nullable=True)
    instahyre_email = Column(String, nullable=True)
    instahyre_pass = Column(String, nullable=True)

class PlatformConnection(Base):
    __tablename__ = "platform_connections"
    id = Column(Integer, primary_key=True, index=True)
    platform_id = Column(String, unique=True, index=True) # e.g., 'linkedin', 'naukri'
    is_connected = Column(Integer, default=1) # 1: Connected, 0: Disconnected
    last_login = Column(DateTime, default=datetime.utcnow)
    session_path = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

# Seed default profile if not exists
db = SessionLocal()
if db.query(Profile).count() == 0:
    default_profile = Profile(
        full_name="Kanishk Soni",
        email="kanishk@example.com",
        phone="+91-0000000000",
        resume_text="Senior Full Stack Developer with 5 years of experience in MERN stack and Python. Built multiple autonomous agents and scalable web applications."
    )
    db.add(default_profile)
    db.commit()
db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
