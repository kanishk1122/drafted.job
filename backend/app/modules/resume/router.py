from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.resume.model import Resume
from app.modules.ai.service import ai_service
import pypdf
import docx
from io import BytesIO
import json
from typing import Optional

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def extract_text_from_pdf(file_content: bytes) -> str:
    pdf_reader = pypdf.PdfReader(BytesIO(file_content))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def extract_text_from_docx(file_content: bytes) -> str:
    doc = docx.Document(BytesIO(file_content))
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

@router.post("/upload")
async def upload_resume(
    user_id: int = Form(...),
    file: Optional[UploadFile] = File(None),
    manual_data: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload and extract resume details. 
    Supports PDF/DOCX or manual text input.
    Limit: 5MB for files.
    """
    raw_text = ""
    filename = "Manual Entry"
    file_type = "text"

    if file:
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
        
        content = await file.read()
        filename = file.filename
        
        if filename.endswith(".pdf"):
            raw_text = extract_text_from_pdf(content)
            file_type = "pdf"
        elif filename.endswith((".docx", ".doc")):
            raw_text = extract_text_from_docx(content)
            file_type = "docx"
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please use PDF or DOCX.")

    elif manual_data:
        raw_text = manual_data
    else:
        raise HTTPException(status_code=400, detail="Either a file or manual data must be provided")

    # Call AI Service to parse structured data
    data = await ai_service.parse_resume(raw_text)

    # Save to Database with individual columns
    db_resume = Resume(
        user_id=user_id,
        filename=filename,
        file_type=file_type,
        raw_text=raw_text,
        full_name=data.get("full_name"),
        email=data.get("email"),
        phone=data.get("phone"),
        location=data.get("location"),
        summary=data.get("summary"),
        skills=json.dumps(data.get("skills", [])),
        experience=json.dumps(data.get("experience", [])),
        education=json.dumps(data.get("education", []))
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    # Tactical Sync: Update UserContext with primary professional data
    from app.modules.user.model import UserContext
    user = db.query(UserContext).filter(UserContext.id == user_id).first()
    if user:
        # Update core skills for scouting heuristic
        if data.get("skills"):
            user.skills = ", ".join(data.get("skills")[:15]) # Top 15 skills
        
        # Save raw text for deep context matching
        user.resume_text = raw_text
        
        # Update target role if current is empty (guess from most recent experience or summary)
        if not user.target_roles and data.get("experience"):
            first_exp = data.get("experience")[0]
            user.target_roles = first_exp.get("role") or first_exp.get("title")
        
        # Save seniority for platform search calibration
        if data.get("total_years_of_experience"):
            user.years_of_experience = data.get("total_years_of_experience")
            
        db.commit()

    return {
        "id": db_resume.id,
        "filename": db_resume.filename,
        "full_name": db_resume.full_name,
        "skills": data.get("skills"),
        "professional_data": data
    }

@router.get("/my/{user_id}")
async def get_my_resume(user_id: int, db: Session = Depends(get_db)):
    """Retrieve the most recent resume record for a user or create a shell one if none exists."""
    resume = db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.created_at.desc()).first()
    
    if not resume:
        # Self-healing: Initialize a shell record if none exists to avoid 404
        resume = Resume(user_id=user_id, filename="Manual Profile")
        db.add(resume)
        db.commit()
        db.refresh(resume)

    def safe_json_load(val):
        if not val: return []
        try:
            return json.loads(val)
        except:
            if isinstance(val, str) and "," in val:
                return [s.strip() for s in val.split(",")]
            return [val] if val else []

    return {
        "id": resume.id,
        "filename": resume.filename,
        "full_name": resume.full_name,
        "email": resume.email,
        "phone": resume.phone,
        "location": resume.location,
        "summary": resume.summary,
        "skills": safe_json_load(resume.skills),
        "experience": safe_json_load(resume.experience),
        "education": safe_json_load(resume.education),
        "updated_at": resume.updated_at
    }

@router.patch("/sync/{user_id}")
async def sync_resume_data(
    user_id: int, 
    data: dict, 
    db: Session = Depends(get_db)
):
    """Update or Create resume data manually."""
    resume = db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.created_at.desc()).first()
    
    if not resume:
        # Self-healing: Create a shell record if none exists
        resume = Resume(user_id=user_id, filename="Manual Profile")
        db.add(resume)
        db.flush() 

    for key, value in data.items():
        if key in ["skills", "experience", "education"] and value is not None:
            setattr(resume, key, json.dumps(value))
        elif hasattr(resume, key) and value is not None:
          setattr(resume, key, value)
    
    db.commit()
    db.refresh(resume)

    # Signal synchronization to UserContext
    from app.modules.user.model import UserContext
    user = db.query(UserContext).filter(UserContext.id == user_id).first()
    if user:
        if "skills" in data and data["skills"]:
            user.skills = ", ".join(data["skills"][:15])
        if "summary" in data:
            user.summary = data["summary"]
        if "total_years_of_experience" in data:
            user.years_of_experience = data["total_years_of_experience"]
        db.commit()

    def safe_json_load(val):
        if not val: return []
        try:
            return json.loads(val)
        except:
            if isinstance(val, str) and "," in val:
                return [s.strip() for s in val.split(",")]
            return [val] if val else []

    return {
        "id": resume.id,
        "filename": resume.filename,
        "full_name": resume.full_name,
        "email": resume.email,
        "phone": resume.phone,
        "location": resume.location,
        "summary": resume.summary,
        "skills": safe_json_load(resume.skills),
        "experience": safe_json_load(resume.experience),
        "education": safe_json_load(resume.education),
        "updated_at": resume.updated_at,
        "message": "Identity hub synchronized successfully"
    }
