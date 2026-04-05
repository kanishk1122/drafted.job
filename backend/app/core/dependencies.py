from fastapi import Depends, HTTPException, Cookie, Header
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.core.config import settings
from app.core.database import get_db
from app.modules.user.model import UserContext
from typing import Optional

def get_current_user(
    db: Session = Depends(get_db),
    access_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
) -> UserContext:
    # Manual token detection for Electron support
    token = access_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]

    if not token:
        raise HTTPException(status_code=401, detail="No session authority found.")
    
    try:
        payload = jwt.decode(token=token, key=settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials.")
    except JWTError:
        raise HTTPException(status_code=401, detail="Session expired or invalid.")
        
    user = db.query(UserContext).filter(UserContext.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Profile not found.")
    
    return user
