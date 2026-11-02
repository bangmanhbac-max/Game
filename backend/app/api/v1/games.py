from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ...db.session import get_db
from ...db.models import GameSessionEntity, UserEntity
from ...models.game_session import GameRecordRequest, GameSessionResponse, LeaderboardItemResponse
from ...core.deps import get_current_user_optional, get_current_user

router = APIRouter()

@router.post("/games/record", response_model=GameSessionResponse)
async def record_game_session(
    payload: GameRecordRequest,
    current_user: Optional[UserEntity] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Ghi nhận kết quả một ván chơi game (Bắn gà, Magic touch, Quiz)"""
    new_session = GameSessionEntity(
        user_id=current_user.id if current_user else None,
        package_id=payload.package_id,
        game_mode=payload.game_mode,
        score=payload.score,
        streak=payload.streak,
        max_streak=payload.max_streak,
        accuracy=payload.accuracy,
        words_defeated=payload.words_defeated,
        played_at=datetime.utcnow()
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return GameSessionResponse.model_validate(new_session)

@router.get("/games/leaderboard", response_model=List[LeaderboardItemResponse])
async def get_leaderboard(
    game_mode: Optional[str] = Query(None, description="Lọc theo chế độ game hoặc để trống lấy tất cả"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Bảng vàng vinh danh Top người chơi có điểm số cao nhất"""
    query = db.query(GameSessionEntity, UserEntity).join(
        UserEntity, GameSessionEntity.user_id == UserEntity.id
    )

    if game_mode:
        query = query.filter(GameSessionEntity.game_mode == game_mode)

    records = query.order_by(desc(GameSessionEntity.score)).limit(limit).all()

    leaderboard = []
    for rank, (session, user) in enumerate(records, start=1):
        leaderboard.append(
            LeaderboardItemResponse(
                rank=rank,
                username=user.username,
                full_name=user.full_name or user.username,
                avatar=user.avatar,
                score=session.score,
                accuracy=session.accuracy,
                game_mode=session.game_mode,
                played_at=session.played_at
            )
        )

    return leaderboard

@router.get("/games/my-history", response_model=List[GameSessionResponse])
async def get_my_game_history(
    current_user: UserEntity = Depends(get_current_user),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Xem lịch sử các trận đấu cá nhân của người dùng đã đăng nhập"""
    sessions = db.query(GameSessionEntity).filter(
        GameSessionEntity.user_id == current_user.id
    ).order_by(desc(GameSessionEntity.played_at)).limit(limit).all()

    return [GameSessionResponse.model_validate(s) for s in sessions]
