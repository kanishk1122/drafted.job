from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base

# Import models to ensure they are registered for creation
from app.modules.user import model as user_model
from app.modules.job import model as job_model
from app.modules.resume import model as resume_model
from app.modules.browser import session_model as scout_session_model  # NEW: Scout session history
from app.modules.ai import model as ai_model # NEW: Tactical Recommendations
from app.modules.notification import model as notification_model # NEW: Alerting Engine

# Create database tables (In production, use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "app://mission",
        "app://local"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Industrial Grade JobHuntr API Ready"}

# Import and include routers from modules
from app.modules.user.router import router as user_router
from app.modules.job.router import router as job_router
from app.modules.ai.router import router as ai_router
from app.modules.pipeline.router import router as pipeline_router
from app.modules.browser.router import router as browser_router
from app.modules.resume.router import router as resume_router
from app.modules.notification.router import router as notification_router

app.include_router(user_router, prefix="/api/v1/user", tags=["user"])
app.include_router(job_router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(pipeline_router, prefix="/api/v1/pipeline", tags=["pipeline"])
app.include_router(browser_router, prefix="/api/v1/browser", tags=["browser"])
app.include_router(resume_router, prefix="/api/v1/resume", tags=["resume"])
app.include_router(notification_router, prefix="/api/v1/notification", tags=["notification"])
