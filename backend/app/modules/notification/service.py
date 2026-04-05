from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
from .model import Notification
from .schema import NotificationCreate, NotificationUpdate, NotificationResponse
from app.core.websocket import manager

class NotificationService:
    @staticmethod
    async def create_notification(db: Session, notification: NotificationCreate):
        db_notification = Notification(**notification.dict())
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
        
        # Real-time Push via WebSockets
        # Convert DB object to dict/response model for sending
        response_data = NotificationResponse.from_orm(db_notification).dict()
        # Force datetime to string for JSON serialization
        response_data['created_at'] = response_data['created_at'].isoformat()
        
        await manager.send_personal_message(
            {"type": "new_notification", "payload": response_data},
            notification.user_id
        )
        
        return db_notification

    @staticmethod
    async def get_user_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 50):
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        total = query.count()
        unread_count = query.filter(Notification.is_read == False).count()
        
        # Order by created_at descending (latest first)
        items = query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()
        
        return items, total, unread_count

    @staticmethod
    async def mark_as_read(db: Session, notification_id: int, user_id: int):
        db_notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if db_notification:
            db_notification.is_read = True
            db.commit()
            db.refresh(db_notification)
            return db_notification
        return None

    @staticmethod
    async def mark_all_as_read(db: Session, user_id: int):
        db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({Notification.is_read: True}, synchronize_session=False)
        db.commit()
        return True
    
    @staticmethod
    async def clean_old_notifications(db: Session, user_id: int, keep_count: int = 100):
        # Keep only the last N notifications to avoid database bloat
        subquery = db.query(Notification.id).filter(
            Notification.user_id == user_id
        ).order_by(desc(Notification.created_at)).offset(keep_count).subquery()
        
        db.query(Notification).filter(Notification.id.in_(subquery)).delete(synchronize_session=False)
        db.commit()
        return True
