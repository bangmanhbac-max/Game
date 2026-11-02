from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ...db.session import get_db
from ...db.models import UserEntity
from ...models.user import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse, UserProfileUpdate
from ...core.security import get_password_hash, verify_password, create_access_token
from ...core.deps import get_current_user

router = APIRouter()

@router.post("/auth/register", response_model=TokenResponse)
async def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """Đăng ký tài khoản người chơi mới"""
    # 1. Kiểm tra username đã tồn tại chưa
    if db.query(UserEntity).filter(UserEntity.username == payload.username.lower()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác."
        )

    # 2. Kiểm tra email đã tồn tại chưa
    if db.query(UserEntity).filter(UserEntity.email == payload.email.lower()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Địa chỉ Email này đã được đăng ký tài khoản."
        )

    # 3. Tạo tài khoản mới
    new_user = UserEntity(
        username=payload.username.lower().strip(),
        email=payload.email.lower().strip(),
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name or payload.username,
        avatar=payload.avatar or "iron-man",
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Sinh JWT token
    token = create_access_token(subject=new_user.id)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/auth/login", response_model=TokenResponse)
async def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    """Đăng nhập bằng Username hoặc Email"""
    identifier = payload.username_or_email.lower().strip()
    
    # Tìm kiếm theo username hoặc email
    user = db.query(UserEntity).filter(
        (UserEntity.username == identifier) | (UserEntity.email == identifier)
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập, email hoặc mật khẩu không chính xác."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản của bạn hiện đang bị tạm khóa."
        )

    token = create_access_token(subject=user.id)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/auth/me", response_model=UserResponse)
async def get_my_profile(current_user: UserEntity = Depends(get_current_user)):
    """Lấy thông tin tài khoản hiện tại từ JWT Bearer token"""
    return UserResponse.model_validate(current_user)

@router.put("/auth/profile", response_model=UserResponse)
async def update_profile(
    payload: UserProfileUpdate,
    current_user: UserEntity = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cập nhật avatar siêu anh hùng hoặc họ tên hiển thị"""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.avatar is not None:
        current_user.avatar = payload.avatar.strip()
    
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
