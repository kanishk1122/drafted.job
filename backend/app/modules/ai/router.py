from fastapi import APIRouter, HTTPException, Depends
from app.modules.ai.service import ai_service
from app.modules.ai.schema import UserBioRequest, ExtractedInfo
from app.modules.ai.service_recommendation import recommendation_service
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.modules.user.model import UserContext
from pydantic import BaseModel
from typing import Dict, Any, Optional

router = APIRouter()

class EnhanceResumeRequest(BaseModel):
    user_id: Optional[int] = None
    section: str
    instructions: str
    current_data: Dict[str, Any]

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

@router.get("/recommendations")
async def get_recommendations(
    db: Session = Depends(get_db), 
    current_user: UserContext = Depends(get_current_user)
):
    """
    Get customized tactical career suggestions using unified auth.
    """
    try:
        return await recommendation_service.get_recommendations(db, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/enhance-resume")
async def enhance_resume(request: EnhanceResumeRequest):
    """
    Surgically refine a specific resume section using AI intelligence directives.
    """
    try:
        updated_data = await ai_service.enhance_resume_content(
            section=request.section,
            instructions=request.instructions,
            current_data=request.current_data
        )
        return {"enhanced_data": updated_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Enhancement failure: {str(e)}")

@router.post("/recommendations/refresh")
async def refresh_recommendations(
    db: Session = Depends(get_db), 
    current_user: UserContext = Depends(get_current_user)
):
    """
    Trigger AI to regenerate suggestions using unified auth.
    """
    try:
        return await recommendation_service.refresh_recommendations(db, current_user.id)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
