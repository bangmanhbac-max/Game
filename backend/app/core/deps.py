from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import UserEntity
from .security import decode_access_token

security_scheme = HTTPBearer(auto_error=False)

def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Optional[UserEntity]:
    """Lấy thông tin người dùng từ JWT token nếu có (cho phép chơi ẩn danh hoặc đã đăng nhập)"""
    if not auth:
        return None
    
    token = auth.credentials
    payload = decode_access_token(token)
    if not payload:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    user = db.query(UserEntity).filter(UserEntity.id == user_id, UserEntity.is_active == True).first()
    return user

def get_current_user(
    user: Optional[UserEntity] = Depends(get_current_user_optional)
) -> UserEntity:
    """Bắt buộc người dùng phải gửi token hợp lệ để truy cập endpoint"""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
