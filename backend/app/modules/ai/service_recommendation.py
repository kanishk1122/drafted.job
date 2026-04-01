from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.modules.ai.service import ai_service
from app.modules.ai.model import UserRecommendation
from app.modules.user.model import UserContext
from fastapi import HTTPException
import json

class RecommendationService:
    async def get_recommendations(self, db: Session, user_id: int):
        rec = db.query(UserRecommendation).filter(UserRecommendation.user_id == user_id).first()
        if not rec:
            # If no recommendations exist, generate them for the first time
            return await self.refresh_recommendations(db, user_id)
        
        return {
            "recommendations": json.loads(rec.content),
            "last_refreshed": rec.last_refreshed
        }

    async def refresh_recommendations(self, db: Session, user_id: int):
        rec = db.query(UserRecommendation).filter(UserRecommendation.user_id == user_id).first()
        
        # Check 24 hour limit
        if rec and rec.last_refreshed:
            if datetime.utcnow() - rec.last_refreshed < timedelta(hours=24):
                raise HTTPException(
                    status_code=429, 
                    detail="Tactical Intelligence is already optimal. Refresh sequence available in 24 hours."
                )
        
        # Fetch User Context and Resume for AI input
        user = db.query(UserContext).filter(UserContext.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User Identity not found for tactical analysis.")

        # Get the latest resume text if available
        resume_text = user.resume_text or ""
        user_info = {
            "full_name": user.full_name,
            "target_roles": user.target_roles,
            "skills": user.skills
        }

        # AI Generation
        new_recs = await ai_service.generate_tactical_recommendations(user_info, resume_text)
        
        if not rec:
            rec = UserRecommendation(
                user_id=user_id,
                content=json.dumps(new_recs),
                last_refreshed=datetime.utcnow()
            )
            db.add(rec)
        else:
            rec.content = json.dumps(new_recs)
            rec.last_refreshed = datetime.utcnow()
        
        db.commit()
        db.refresh(rec)
        
        return {
            "recommendations": new_recs,
            "last_refreshed": rec.last_refreshed
        }

recommendation_service = RecommendationService()
