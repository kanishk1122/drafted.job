from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.websocket import manager
from .schema import NotificationResponse, NotificationListResponse, NotificationUpdate, NotificationCreate
from .service import NotificationService
from app.modules.user.model import UserContext

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=NotificationListResponse)
async def get_user_notifications(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    items, total, unread_count = await NotificationService.get_user_notifications(
        db, current_user.id, skip, limit
    )
    return {
        "items": items,
        "total": total,
        "unread_count": unread_count
    }

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    db_notification = await NotificationService.mark_as_read(db, notification_id, current_user.id)
    if not db_notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return db_notification

@router.patch("/read-all")
async def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    await NotificationService.mark_all_as_read(db, current_user.id)
    return {"status": "success", "message": "All notifications marked as read"}

@router.post("/test-notification", response_model=NotificationResponse)
async def create_test_notification(
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    notif = NotificationCreate(
        user_id=current_user.id,
        title="Mission Update Successful",
        message="Your automated scout completed its mission and discovered 5 new roles.",
        type="discovery"
    )
    return await NotificationService.create_notification(db, notif)

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    # For now, we trust the user_id from the URL relative to the active session
    # In a hard-production setting, we'd verify a token here too
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
