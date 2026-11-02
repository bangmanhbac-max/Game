from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class GameRecordRequest(BaseModel):
    package_id: str
    game_mode: str = Field(..., description="chicken-shooter | magic-touch | quiz-arena")
    score: int = Field(ge=0, description="Điểm số đạt được")
    streak: int = Field(default=0, ge=0)
    max_streak: int = Field(default=0, ge=0)
    accuracy: float = Field(default=100.0, ge=0.0, le=100.0)
    words_defeated: int = Field(default=0, ge=0)

class GameSessionResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    package_id: str
    game_mode: str
    score: int
    streak: int
    max_streak: int
    accuracy: float
    words_defeated: int
    played_at: datetime

    class Config:
        from_attributes = True

class LeaderboardItemResponse(BaseModel):
    rank: int
    username: str
    full_name: Optional[str] = None
    avatar: str
    score: int
    accuracy: float
    game_mode: str
    played_at: datetime
