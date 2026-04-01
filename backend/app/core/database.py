import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

class Base(DeclarativeBase):
    pass

# Retry logic for industrial reliability
engine = None
connected = False
while not connected:
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            connected = True
            print("📦 Database Connection: ESTABLISHED")
    except Exception as e:
        print(f"⌛ Waiting for Database: {e}")
        time.sleep(2)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
