from sqlalchemy.orm import Session
from fastapi import HTTPException, Response
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.modules.user.model import UserContext
from app.modules.user.schema import UserCreate, UserLogin, UserUpdate
from jose import JWTError, jwt

class UserService:
    def get_me(self, db: Session, token: str):
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            email: str = payload.get("sub")
            if email is None:
                raise HTTPException(status_code=401, detail="Could not validate professional credentials.")
        except JWTError:
            raise HTTPException(status_code=401, detail="Professional session expired or invalid.")
            
        user = db.query(UserContext).filter(UserContext.email == email).first()
        if user is None:
            raise HTTPException(status_code=404, detail="Professional profile not found.")
        return user

        
    def register_user(self, db: Session, user_in: UserCreate, response: Response):
        db_user = db.query(UserContext).filter(UserContext.email == user_in.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="User already indexed.")
        
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
        
        return {
            "full_name": new_user.full_name,
            "email": new_user.email
        }

    def login_user(self, db: Session, user_in: UserLogin, response: Response):
        user = db.query(UserContext).filter(UserContext.email == user_in.email).first()
        if not user or not verify_password(user_in.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Authentication failed. Bio-lock mismatch.")
        
        access_token = create_access_token(data={"sub": user.email})
        self._set_auth_cookie(response, access_token)
        
        return {
            "full_name": user.full_name,
            "email": user.email
        }

    def logout_user(self, response: Response):
        response.delete_cookie("access_token")
        return {"message": "Session terminated successfully."}

    def get_user_context(self, db: Session):
        user = db.query(UserContext).first()
        if not user:
            raise HTTPException(status_code=404, detail="User context not found")
        return user

    def update_user_context(self, db: Session, update: UserUpdate):
        user = db.query(UserContext).first()
        if not user:
            raise HTTPException(status_code=404, detail="User context not found")
        
        update_data = update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)
        
        db.commit()
        db.refresh(user)
        return user

    def _set_auth_cookie(self, response: Response, token: str):
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            max_age=settings.access_token_expire_minutes * 60,
            expires=settings.access_token_expire_minutes * 60,
            samesite="lax",
            secure=False, # Set to True in production with HTTPS
        )

user_service = UserService()
