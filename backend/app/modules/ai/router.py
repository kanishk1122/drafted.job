from fastapi import APIRouter, HTTPException
from app.modules.ai.service import ai_service
from app.modules.ai.schema import UserBioRequest, ExtractedInfo
from app.modules.ai.service_recommendation import recommendation_service

router = APIRouter()

@router.post("/extract-intent", response_model=ExtractedInfo)
async def extract_intent(user_bio: UserBioRequest):
    """
    Extract professional intent and career search parameters from unstructured text.
    """
    try:
        if not user_bio.message:
            raise HTTPException(status_code=400, detail="User bio message cannot be empty")
        
        result = await ai_service.extract_intent(user_bio.message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Intelligence failure: {str(e)}")

from app.core.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, Cookie
from jose import jwt
from app.core.config import settings

@router.get("/recommendations")
async def get_recommendations(db: Session = Depends(get_db), access_token: str = Cookie(None)):
    """
    Get customized tactical career suggestions.
    """
    try:
        # Extract user_id from token
        if not access_token:
            # Fallback to first user for dev
            user_id = 1
        else:
            payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email = payload.get("sub")
            from app.modules.user.model import UserContext
            user = db.query(UserContext).filter(UserContext.email == email).first()
            user_id = user.id if user else 1
            
        return await recommendation_service.get_recommendations(db, user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendations/refresh")
async def refresh_recommendations(db: Session = Depends(get_db), access_token: str = Cookie(None)):
    """
    Trigger AI to regenerate 3 unique career suggestions (24h cooldown).
    """
    try:
        if not access_token:
            user_id = 1
        else:
            payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email = payload.get("sub")
            from app.modules.user.model import UserContext
            user = db.query(UserContext).filter(UserContext.email == email).first()
            user_id = user.id if user else 1
            
        return await recommendation_service.refresh_recommendations(db, user_id)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
