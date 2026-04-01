from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from app.modules.browser.service import browser_service

router = APIRouter()

class ProfileStatus(BaseModel):
    user_id: str

@router.get("/{user_id}/status")
async def get_profile_status(user_id: str):
    path = browser_service.get_user_profile_path(user_id)
    exists = os.path.exists(path)
    return {"user_id": user_id, "profile_path": path, "stored": exists}

@router.post("/connect")
async def connect_profile(user_id: str):
    """
    In a real-world scenario, this would launch a VNC-enabled browser 
    container to allow the user to manually log in once.
    """
    path = browser_service.get_user_profile_path(user_id)
    return {"message": "Success", "profile_path": path, "instruction": "Profile created. Future tasks will use this persistent context."}
