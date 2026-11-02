from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ...db.session import get_db
from ...db.models import ContactInquiryEntity

router = APIRouter()

class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str

@router.post("/contact")
def submit_contact_inquiry(req: ContactRequest, db: Session = Depends(get_db)):
    """Gửi tin nhắn liên hệ, phản hồi hoặc yêu cầu hỗ trợ"""
    if not req.name.strip() or not req.email.strip() or not req.message.strip():
        raise HTTPException(status_code=400, detail="Vui lòng điền đầy đủ họ tên, email và nội dung tin nhắn")

    inquiry = ContactInquiryEntity(
        name=req.name.strip(),
        email=req.email.strip(),
        subject=req.subject.strip() or "Ý kiến đóng góp EduPlay",
        message=req.message.strip(),
        created_at=datetime.utcnow()
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    return {
        "status": "success",
        "message": "Cảm ơn bạn đã liên hệ! Đội ngũ AI EduPlay sẽ phản hồi qua email của bạn sớm nhất.",
        "inquiry_id": inquiry.id
    }

@router.get("/contact")
def list_contact_inquiries(limit: int = 50, db: Session = Depends(get_db)):
    """Lấy danh sách các liên hệ đã gửi (Dành cho Quản trị viên)"""
    inquiries = db.query(ContactInquiryEntity).order_by(desc(ContactInquiryEntity.created_at)).limit(limit).all()
    return [
        {
            "id": i.id,
            "name": i.name,
            "email": i.email,
            "subject": i.subject,
            "message": i.message,
            "status": i.status,
            "created_at": i.created_at.isoformat() if i.created_at else None
        }
        for i in inquiries
    ]
