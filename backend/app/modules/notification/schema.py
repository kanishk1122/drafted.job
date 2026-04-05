from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class NotificationBase(BaseModel):
    title: str
    message: str
    type: Optional[str] = "info"
    meta_data: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = True

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    unread_count: int
