from fastapi import APIRouter, HTTPException
from app.modules.ai.service import ai_service
from app.modules.ai.schema import UserBioRequest, ExtractedInfo

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
