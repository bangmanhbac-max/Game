import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class UserEntity(Base):
    """Bảng người dùng hệ thống EduPlay"""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    avatar = Column(String(100), default="iron-man", nullable=False)  # iron-man, doctor-strange, thor, cap, spiderman, etc.
    role = Column(String(20), default="user", nullable=False)  # user, admin
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Quan hệ
    packages = relationship("PackageEntity", back_populates="creator", cascade="all, delete-orphan")
    game_sessions = relationship("GameSessionEntity", back_populates="user", cascade="all, delete-orphan")
    word_progress = relationship("UserWordProgressEntity", back_populates="user", cascade="all, delete-orphan")


class PackageEntity(Base):
    """Bảng bộ bài học / tài liệu (Learning Package)"""
    __tablename__ = "learning_packages"

    package_id = Column(String(64), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    source_filename = Column(String(255), nullable=True)
    target_language = Column(String(20), default="zh-CN", nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Quan hệ
    creator = relationship("UserEntity", back_populates="packages")
    vocabulary_items = relationship("VocabularyItemEntity", back_populates="package", cascade="all, delete-orphan", order_by="VocabularyItemEntity.order_index")
    quiz_items = relationship("QuizItemEntity", back_populates="package", cascade="all, delete-orphan", order_by="QuizItemEntity.order_index")
    game_sessions = relationship("GameSessionEntity", back_populates="package")


class VocabularyItemEntity(Base):
    """Bảng chi tiết các từ vựng thuộc về bài học"""
    __tablename__ = "vocabulary_items"

    id = Column(String(64), primary_key=True)
    package_id = Column(String(64), ForeignKey("learning_packages.package_id", ondelete="CASCADE"), nullable=False, index=True)
    target_text = Column(String(100), nullable=False)  # VD: 你好
    phonetic = Column(String(100), nullable=False)     # VD: nǐ hǎo
    type_target = Column(String(100), nullable=False)  # VD: nihao (để gõ phím)
    meaning = Column(String(255), nullable=False)      # VD: Xin chào
    example = Column(Text, nullable=True)
    difficulty = Column(Integer, default=1, nullable=False)
    stroke_gesture = Column(String(50), default="horizontal", nullable=False)  # horizontal, vertical, slash, backslash, v_shape, caret, circle, lightning
    characters_json = Column(Text, nullable=True) # Danh sách các chữ cứng cấu thành từ vựng (dùng cho Granny Escape)
    order_index = Column(Integer, default=0, nullable=False)

    # Quan hệ
    package = relationship("PackageEntity", back_populates="vocabulary_items")
    progress_records = relationship("UserWordProgressEntity", back_populates="vocab", cascade="all, delete-orphan")


class QuizItemEntity(Base):
    """Bảng câu hỏi trắc nghiệm thuộc về bài học"""
    __tablename__ = "quiz_items"

    id = Column(String(64), primary_key=True)
    package_id = Column(String(64), ForeignKey("learning_packages.package_id", ondelete="CASCADE"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False)  # Lưu JSON list chuỗi 4 đáp án: ["A", "B", "C", "D"]
    correct_index = Column(Integer, default=0, nullable=False)
    explanation = Column(Text, nullable=True)
    points = Column(Integer, default=100, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)

    # Quan hệ
    package = relationship("PackageEntity", back_populates="quiz_items")


class GameSessionEntity(Base):
    """Bảng lưu lịch sử từng trận đấu của người chơi"""
    __tablename__ = "game_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    package_id = Column(String(64), ForeignKey("learning_packages.package_id", ondelete="CASCADE"), nullable=False, index=True)
    game_mode = Column(String(50), nullable=False)  # chicken-shooter, magic-touch, quiz-arena, granny-forest, flashcard
    score = Column(Integer, default=0, nullable=False)
    streak = Column(Integer, default=0, nullable=False)
    max_streak = Column(Integer, default=0, nullable=False)
    accuracy = Column(Float, default=100.0, nullable=False)
    words_defeated = Column(Integer, default=0, nullable=False)
    played_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Quan hệ
    user = relationship("UserEntity", back_populates="game_sessions")
    package = relationship("PackageEntity", back_populates="game_sessions")


class UserWordProgressEntity(Base):
    """Bảng theo dõi mức độ ghi nhớ từng từ vựng của User (Spaced Repetition)"""
    __tablename__ = "user_word_progress"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    vocab_id = Column(String(64), ForeignKey("vocabulary_items.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery_level = Column(Integer, default=0, nullable=False)  # 0 đến 5 sao
    correct_count = Column(Integer, default=0, nullable=False)
    wrong_count = Column(Integer, default=0, nullable=False)
    last_reviewed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Quan hệ
    user = relationship("UserEntity", back_populates="word_progress")
    vocab = relationship("VocabularyItemEntity", back_populates="progress_records")


class DocumentRecordEntity(Base):
    """Bảng quản lý tài liệu và file từ vựng đã tải lên hệ thống"""
    __tablename__ = "uploaded_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    char_count = Column(Integer, default=0, nullable=False)
    custom_prompt = Column(Text, nullable=True) # Lời nhắc/câu lệnh prompt người dùng nhập
    vlm_mode = Column(String(100), default="vlm-active", nullable=False)
    package_id = Column(String(64), ForeignKey("learning_packages.package_id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ChatMessageEntity(Base):
    """Bảng lịch sử trò chuyện AI Copilot và Kênh Chat Thế Giới"""
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    channel = Column(String(50), default="world_chat", nullable=False) # 'world_chat' hoặc 'ai_copilot'
    sender_name = Column(String(100), default="Người chơi", nullable=False)
    sender_avatar = Column(String(100), default="iron-man", nullable=False)
    role = Column(String(20), default="user", nullable=False) # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class FriendshipEntity(Base):
    """Bảng kết bạn giữa người dùng trong cộng đồng EduPlay"""
    __tablename__ = "friendships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    friend_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), default="accepted", nullable=False) # 'pending', 'accepted', 'blocked'
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ContactInquiryEntity(Base):
    """Bảng liên hệ, đóng góp ý kiến và phản hồi từ người dùng"""
    __tablename__ = "contact_inquiries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="new", nullable=False) # 'new', 'reviewed', 'resolved'
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

