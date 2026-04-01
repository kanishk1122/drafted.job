from sqlalchemy.orm import Session
from fastapi import HTTPException, Response
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.modules.user.model import UserContext
from app.modules.user.schema import UserCreate, UserLogin, UserUpdate
from jose import JWTError, jwt

PLATFORM_LIST = ["linkedin", "naukri", "indeed", "foundit", "glassdoor", "ambitionbox", "instahyre"]

class UserService:

    def _safe_user(self, user: UserContext) -> dict:
        """Serialize user safely — NEVER expose hashed_password."""
        active_platforms = [p for p in PLATFORM_LIST if getattr(user, f"{p}_active", False)]
        return {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "target_roles": user.target_roles,
            "skills": user.skills,
            "salary_floor": user.salary_floor,
            "has_resume": bool(user.resume_text),
            # Per-platform status flags
            "linkedin_active": user.linkedin_active,
            "linkedin_email": user.linkedin_email,
            "naukri_active": user.naukri_active,
            "naukri_email": user.naukri_email,
            "indeed_active": user.indeed_active,
            "indeed_email": getattr(user, "indeed_email", None),
            "foundit_active": user.foundit_active,
            "glassdoor_active": user.glassdoor_active,
            "ambitionbox_active": user.ambitionbox_active,
            "instahyre_active": getattr(user, "instahyre_active", False),
            # Computed: list of activated platform IDs for UI
            "active_platforms": active_platforms,
        }

    def get_me(self, db: Session, token: str):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise HTTPException(status_code=401, detail="Could not validate credentials.")
        except JWTError:
            raise HTTPException(status_code=401, detail="Session expired or invalid.")

        user = db.query(UserContext).filter(UserContext.email == email).first()
        if user is None:
            raise HTTPException(status_code=404, detail="Profile not found.")
        return self._safe_user(user)

    def register_user(self, db: Session, user_in: UserCreate, response: Response):
        db_user = db.query(UserContext).filter(UserContext.email == user_in.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="User already exists.")

        new_user = UserContext(
            full_name=user_in.full_name,
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            target_roles="Senior Software Engineer",
            skills="Python, React",
            salary_floor=120000.0
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        access_token = create_access_token(data={"sub": new_user.email})
        self._set_auth_cookie(response, access_token)

        return {"full_name": new_user.full_name, "email": new_user.email}

    def login_user(self, db: Session, user_in: UserLogin, response: Response):
        user = db.query(UserContext).filter(UserContext.email == user_in.email).first()
        if not user or not verify_password(user_in.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Authentication failed.")

        access_token = create_access_token(data={"sub": user.email})
        self._set_auth_cookie(response, access_token)

        return {"full_name": user.full_name, "email": user.email}

    def logout_user(self, response: Response):
        response.delete_cookie("access_token")
        return {"message": "Session terminated."}

    def get_user_context(self, db: Session):
        user = db.query(UserContext).first()
        if not user:
            raise HTTPException(status_code=404, detail="User context not found")
        return self._safe_user(user)

    def update_user_context(self, db: Session, update: UserUpdate):
        user = db.query(UserContext).first()
        if not user:
            raise HTTPException(status_code=404, detail="User context not found")

        update_data = update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)

        db.commit()
        db.refresh(user)
        return self._safe_user(user)

    def _set_auth_cookie(self, response: Response, token: str):
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            samesite="lax",
            secure=False,
        )

user_service = UserService()
