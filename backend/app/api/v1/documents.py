from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ...db.session import get_db
from ...db.models import DocumentRecordEntity, PackageEntity

router = APIRouter()

@router.get("/documents")
def list_uploaded_documents(db: Session = Depends(get_db)):
    """Lấy danh sách các tài liệu / file từ vựng đã tải lên hệ thống"""
    docs = db.query(DocumentRecordEntity).order_by(desc(DocumentRecordEntity.created_at)).all()
    results = []
    for d in docs:
        pkg_title = None
        if d.package_id:
            pkg = db.query(PackageEntity).filter(PackageEntity.package_id == d.package_id).first()
            if pkg:
                pkg_title = pkg.title
        results.append({
            "id": d.id,
            "filename": d.filename,
            "file_type": d.file_type,
            "char_count": d.char_count,
            "custom_prompt": d.custom_prompt,
            "vlm_mode": d.vlm_mode,
            "package_id": d.package_id,
            "package_title": pkg_title,
            "created_at": d.created_at.isoformat() if d.created_at else None
        })
    return results

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    """Xóa tài liệu khỏi danh sách quản lý"""
    doc = db.query(DocumentRecordEntity).filter(DocumentRecordEntity.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu")
    db.delete(doc)
    db.commit()
    return {"message": "Đã xóa tài liệu thành công", "deleted_id": doc_id}
