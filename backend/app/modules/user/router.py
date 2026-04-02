from fastapi import APIRouter, Depends, Response, Cookie, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.user.schema import UserCreate, UserLogin, UserUpdate
from app.modules.user.service import user_service

router = APIRouter()

@router.get("/me")
def get_me(db: Session = Depends(get_db), access_token: str = Cookie(None)):
    """
    Verify the professional session and retrieve profile data.
    """
    if not access_token:
        raise HTTPException(status_code=401, detail="No access token found.")
    return user_service.get_me(db, access_token)

@router.post("/register")
def register(user_in: UserCreate, response: Response, db: Session = Depends(get_db)):
    """
    Initialize a new professional profile.
    """
    return user_service.register_user(db, user_in, response)

@router.post("/login")
def login(user_in: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    Verify identity and establish secure session.
    """
    return user_service.login_user(db, user_in, response)

@router.post("/logout")
def logout(response: Response):
    """
    Terminate current professional session.
    """
    return user_service.logout_user(response)

@router.get("/")
def get_context(db: Session = Depends(get_db)):
    """
    Fetch full career search context.
    """
    return user_service.get_user_context(db)

@router.get("/insights")
def get_insights(db: Session = Depends(get_db)):
    """
    Retrieve real-time profile authority and market demand intelligence.
    """
    return user_service.get_user_insights(db)

@router.patch("/")
def update_context(update: UserUpdate, db: Session = Depends(get_db)):
    """
    Update professional profile parameters.
    """
    return user_service.update_user_context(db, update)
