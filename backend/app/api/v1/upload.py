import os
import shutil
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, Header, Depends, HTTPException
from sqlalchemy.orm import Session
from ...core.config import settings
from ...db.session import get_db
from ...db.models import DocumentRecordEntity
from ...models.document import DocumentExtractResult
from ...services.ai.vlm_engine import VLMEngine

router = APIRouter()
vlm_engine = VLMEngine()

@router.post("/upload", response_model=DocumentExtractResult)
async def upload_document(
    file: UploadFile = File(...),
    custom_prompt: Optional[str] = Form(None),
    x_gemini_key: Optional[str] = Header(None, alias="X-Gemini-Key"),
    db: Session = Depends(get_db)
):
    filename = file.filename or "uploaded_file"
    ext = os.path.splitext(filename)[1].lower()
    
    allowed_exts = [".pdf", ".docx", ".doc", ".txt", ".md", ".png", ".jpg", ".jpeg", ".webp"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400, 
            detail=f"Định dạng {ext} không được hỗ trợ. Vui lòng tải lên PDF, DOCX, TXT hoặc ảnh (PNG/JPG)."
        )
        
    temp_path = os.path.join(settings.UPLOAD_DIR, filename)
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Kích hoạt toàn diện VLM Engine kèm custom_prompt từ người dùng
        raw_text, learning_pkg, vlm_mode = vlm_engine.process_file(
            file_path=temp_path,
            filename=filename,
            user_api_key=x_gemini_key,
            custom_prompt=custom_prompt
        )
            
        snippet = raw_text[:300] + ("..." if len(raw_text) > 300 else "")

        # Lưu bản ghi vào cơ sở dữ liệu để quản lý
        try:
            doc_record = DocumentRecordEntity(
                filename=filename,
                file_type=ext[1:],
                char_count=len(raw_text),
                custom_prompt=custom_prompt,
                vlm_mode=vlm_mode,
                package_id=learning_pkg.package_id if learning_pkg else None,
                created_at=datetime.utcnow()
            )
            db.add(doc_record)
            db.commit()
        except Exception as dbe:
            print(f"[DB Warning] Could not save document record: {dbe}")
        
        return DocumentExtractResult(
            filename=filename,
            file_type=ext[1:],
            char_count=len(raw_text),
            raw_text=raw_text,
            preview_snippet=snippet,
            learning_package=learning_pkg,
            vlm_status=f"VLM Active ({vlm_mode})"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi VLM xử lý tài liệu: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

