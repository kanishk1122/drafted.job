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

    return {
        "id": db_resume.id,
        "filename": db_resume.filename,
        "full_name": db_resume.full_name,
        "skills": data.get("skills"),
        "professional_data": data
    }
