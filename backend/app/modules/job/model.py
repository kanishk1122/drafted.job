from enum import Enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.sql import func
from app.core.database import Base
from app.core.config import settings

# Cross-DB vector column: native pgvector on PostgreSQL, JSON Text on SQLite
try:
    from pgvector.sqlalchemy import Vector as _PGVector
    from app.core.database import engine as _engine
    if "postgresql" in str(_engine.url):
        VectorColumn = lambda: Column(_PGVector(settings.EMBEDDING_DIM), nullable=True)
    else:
        raise ImportError("Not PostgreSQL")
except Exception:
    import json as _json
    from sqlalchemy import TypeDecorator
    class _JsonVector(TypeDecorator):
        """Stores float list as JSON TEXT for SQLite compatibility."""
        impl = Text
        cache_ok = True
        def process_bind_param(self, value, dialect):
            if value is None: return None
            if isinstance(value, (list, tuple)): return _json.dumps(value)
            return value
        def process_result_value(self, value, dialect):
            if value is None: return None
            if isinstance(value, str):
                try: return _json.loads(value)
                except Exception: return None
            return value
    VectorColumn = lambda: Column(_JsonVector(), nullable=True)

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
    
    # Semantic vector embedding (pgvector on Postgres, JSON text on SQLite)
    embedding = VectorColumn()
    
    # Vector similarity score vs user resume (0-100, computed on save)
    vector_score = Column(Integer, nullable=True)
    
    status = Column(SQLEnum(JobStatus), default=JobStatus.NEW)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
