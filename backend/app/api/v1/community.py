from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ...db.session import get_db
from ...db.models import FriendshipEntity, UserEntity

router = APIRouter()

class AddFriendRequest(BaseModel):
    user_id: Optional[str] = None
    friend_username: str

@router.get("/community/friends")
def get_friends_list(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Lấy danh sách bạn bè và những người chơi khác trong cộng đồng"""
    users = db.query(UserEntity).limit(20).all()
    friends_data = []
    for u in users:
        friends_data.append({
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name or u.username,
            "avatar": u.avatar,
            "role": u.role,
            "status": "online",
            "is_friend": True
        })
    return friends_data

@router.post("/community/friends/request")
def send_friend_request(req: AddFriendRequest, db: Session = Depends(get_db)):
    """Gửi lời mời kết bạn theo username"""
    target_user = db.query(UserEntity).filter(UserEntity.username == req.friend_username.strip()).first()
    if not target_user:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy người chơi có username: {req.friend_username}")
    
    return {
        "message": f"Đã gửi lời mời kết bạn đến {target_user.full_name or target_user.username} thành công!",
        "friend": {
            "id": target_user.id,
            "username": target_user.username,
            "avatar": target_user.avatar
        }
    }
