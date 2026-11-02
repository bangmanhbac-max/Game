import json
from datetime import datetime
from sqlalchemy.orm import Session
from .session import engine, Base, SessionLocal
from .models import UserEntity, PackageEntity, VocabularyItemEntity, QuizItemEntity, GameSessionEntity
from ..core.security import get_password_hash
from ..services.sample_data import SAMPLE_PACKAGES

def init_db():
    """Khởi tạo toàn bộ bảng cơ sở dữ liệu và seed dữ liệu ban đầu nếu database trống"""
    # 1. Tạo tất cả bảng nếu chưa có
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 2. Tạo tài khoản mẫu Demo Avenger nếu chưa có
        demo_user = db.query(UserEntity).filter(UserEntity.username == "avenger_hero").first()
        if not demo_user:
            demo_user = UserEntity(
                username="avenger_hero",
                email="hero@avengers.eduplay.ai",
                hashed_password=get_password_hash("password123"),
                full_name="Tony Stark",
                avatar="iron-man",
                role="admin"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

        # 3. Seed các gói bài học mẫu (HSK 1 và Tech English) vào Database
        for pkg_key, pkg_data in SAMPLE_PACKAGES.items():
            existing = db.query(PackageEntity).filter(PackageEntity.package_id == pkg_data.package_id).first()
            if not existing:
                pkg_entity = PackageEntity(
                    package_id=pkg_data.package_id,
                    user_id=demo_user.id,
                    title=pkg_data.title,
                    source_filename=pkg_data.source_filename,
                    target_language=pkg_data.vocabulary_deck.target_language,
                    description=pkg_data.vocabulary_deck.description,
                    is_public=True,
                    created_at=datetime.utcnow()
                )
                db.add(pkg_entity)

                # Add Vocab Items
                for idx, v in enumerate(pkg_data.vocabulary_deck.items):
                    v_entity = VocabularyItemEntity(
                        id=f"{pkg_data.package_id}-{v.id}",
                        package_id=pkg_data.package_id,
                        target_text=v.target_text,
                        phonetic=v.phonetic,
                        type_target=v.type_target,
                        meaning=v.meaning,
                        example=v.example,
                        difficulty=v.difficulty,
                        stroke_gesture=v.stroke_gesture,
                        order_index=idx
                    )
                    db.add(v_entity)

                # Add Quiz Items
                for idx, q in enumerate(pkg_data.quiz_deck.items):
                    q_entity = QuizItemEntity(
                        id=f"{pkg_data.package_id}-{q.id}",
                        package_id=pkg_data.package_id,
                        question=q.question,
                        options_json=json.dumps(q.options, ensure_ascii=False),
                        correct_index=q.correct_index,
                        explanation=q.explanation,
                        points=q.points,
                        order_index=idx
                    )
                    db.add(q_entity)

                db.commit()

        # 4. Thêm một số điểm mẫu vào Bảng Xếp Hạng để người dùng nhìn thấy leaderboard sinh động
        existing_sessions = db.query(GameSessionEntity).count()
        if existing_sessions == 0 and demo_user:
            sample_records = [
                ("chicken-shooter", 4850, 18, 18, 98.5, 24),
                ("magic-touch", 3600, 14, 14, 95.0, 18),
                ("quiz-arena", 3200, 10, 10, 100.0, 10),
            ]
            for mode, score, streak, max_s, acc, w_def in sample_records:
                session_rec = GameSessionEntity(
                    user_id=demo_user.id,
                    package_id="default-chinese-hsk1",
                    game_mode=mode,
                    score=score,
                    streak=streak,
                    max_streak=max_s,
                    accuracy=acc,
                    words_defeated=w_def,
                    played_at=datetime.utcnow()
                )
                db.add(session_rec)
            db.commit()

        # Seed Kênh Chat Thế Giới mẫu
        from .models import ChatMessageEntity
        existing_chats = db.query(ChatMessageEntity).filter(ChatMessageEntity.channel == "world_chat").count()
        if existing_chats == 0:
            world_samples = [
                ("Doctor Strange", "doctor-strange", "Chào mừng các chiến binh Avengers đến với AI EduPlay! Bạn nào leo top Bắn gà chưa?"),
                ("Peter Parker", "spiderman", "Game ma Granny 3 tầng rừng rậm đỉnh thật sự! Tìm được mảnh chữ '好' là run tay luôn 😱"),
                ("Tony Stark", "iron-man", "VLM AI bóc tách tài liệu chuẩn phết, kể cả chữ dính nhau không dấu cách vẫn chia từ cực chuẩn!"),
                ("Thor Odinson", "thor", "Ai solo Đố vui Trắc nghiệm không? 100 điểm tuyệt đối nào! ⚡")
            ]
            for s_name, s_avatar, s_content in world_samples:
                msg = ChatMessageEntity(
                    channel="world_chat",
                    sender_name=s_name,
                    sender_avatar=s_avatar,
                    role="user",
                    content=s_content,
                    created_at=datetime.utcnow()
                )
                db.add(msg)
            db.commit()

    except Exception as e:
        db.rollback()
        print(f"[Init DB Error] {e}")
    finally:
        db.close()

