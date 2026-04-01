from fastapi import Depends, HTTPException, Cookie
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.core.config import settings
from app.core.database import get_db
from app.modules.user.model import UserContext

def get_current_user(
    db: Session = Depends(get_db),
    access_token: str = Cookie(None)
) -> UserContext:
    if not access_token:
        raise HTTPException(status_code=401, detail="No access token found.")
    
    try:
        payload = jwt.decode(token=access_token, key=settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate professional credentials.")
    except JWTError:
        raise HTTPException(status_code=401, detail="Professional session expired or invalid.")
        
    user = db.query(UserContext).filter(UserContext.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Professional profile not found.")
    
    return user
