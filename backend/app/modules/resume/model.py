from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.config import settings
from datetime import datetime

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
    
    # Semantic vector embedding (pgvector on Postgres, JSON text on SQLite)
    embedding = VectorColumn()

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("UserContext", back_populates="resumes")
