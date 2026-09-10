"""
Schema Migration — Add vector embedding columns to resumes and job_repository tables.
Works for both SQLite (dev) and PostgreSQL (prod/Docker).
"""
import sys
from sqlalchemy import text, inspect
from app.core.database import engine
from app.core.config import settings

inspector = inspect(engine)
is_postgres = "postgresql" in settings.DATABASE_URL
is_sqlite = "sqlite" in settings.DATABASE_URL

print(f"DB: {settings.DATABASE_URL[:40]}... ({'PostgreSQL' if is_postgres else 'SQLite'})")

# ──────────────────────────────────────────────────────────────────
# Check which columns already exist
# ──────────────────────────────────────────────────────────────────
resume_cols = [c['name'] for c in inspector.get_columns('resumes')]
job_cols = [c['name'] for c in inspector.get_columns('job_repository')]

print(f"Resumes existing cols: {resume_cols}")
print(f"Jobs existing cols: {job_cols}")

with engine.begin() as conn:
    # ── resumes.embedding ──
    if 'embedding' not in resume_cols:
        if is_postgres:
            dim = settings.EMBEDDING_DIM
            conn.execute(text(f"ALTER TABLE resumes ADD COLUMN embedding vector({dim})"))
            print(f"✅ Added resumes.embedding vector({dim}) [PostgreSQL]")
        else:
            conn.execute(text("ALTER TABLE resumes ADD COLUMN embedding TEXT"))
            print("✅ Added resumes.embedding TEXT [SQLite]")
    else:
        print("⏭  resumes.embedding already exists — skip")

    # ── job_repository.embedding ──
    if 'embedding' not in job_cols:
        if is_postgres:
            dim = settings.EMBEDDING_DIM
            conn.execute(text(f"ALTER TABLE job_repository ADD COLUMN embedding vector({dim})"))
            print(f"✅ Added job_repository.embedding vector({dim}) [PostgreSQL]")
        else:
            conn.execute(text("ALTER TABLE job_repository ADD COLUMN embedding TEXT"))
            print("✅ Added job_repository.embedding TEXT [SQLite]")
    else:
        print("⏭  job_repository.embedding already exists — skip")

    # ── job_repository.vector_score ──
    if 'vector_score' not in job_cols:
        conn.execute(text("ALTER TABLE job_repository ADD COLUMN vector_score INTEGER"))
        print("✅ Added job_repository.vector_score INTEGER")
    else:
        print("⏭  job_repository.vector_score already exists — skip")

print()
print("Migration complete!")
