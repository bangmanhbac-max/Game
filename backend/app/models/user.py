from datetime import datetime
from typing import Optional
import re
from pydantic import BaseModel, Field, field_validator

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Tên đăng nhập (tối thiểu 3 ký tự)")
    email: str = Field(..., description="Địa chỉ Email hợp lệ")
    password: str = Field(..., min_length=6, description="Mật khẩu (tối thiểu 6 ký tự)")
    full_name: Optional[str] = Field(None, description="Họ và tên hiển thị")
    avatar: Optional[str] = Field("iron-man", description="Mã avatar siêu anh hùng Marvel")

    @field_validator("email")
    def validate_email_format(cls, v: str) -> str:
        pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(pattern, v):
            raise ValueError("Định dạng email không hợp lệ (ví dụ: user@example.com)")
        return v.lower().strip()

class UserLoginRequest(BaseModel):
    username_or_email: str = Field(..., description="Tên đăng nhập hoặc địa chỉ Email")
    password: str = Field(..., description="Mật khẩu")

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    avatar: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar: Optional[str] = None
