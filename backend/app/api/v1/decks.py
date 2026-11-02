import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ...db.session import get_db
from ...db.models import PackageEntity, VocabularyItemEntity, QuizItemEntity, UserEntity
from ...models.document import LearningPackage
from ...models.vocabulary import VocabularyDeck, VocabularyItem
from ...models.quiz import QuizDeck, QuizItem
from ...core.deps import get_current_user_optional

router = APIRouter()

def entity_to_pydantic(entity: PackageEntity) -> LearningPackage:
    """Chuyển đổi SQLAlchemy PackageEntity sang Pydantic LearningPackage model"""
    vocab_items = [
        VocabularyItem(
            id=v.id.split("-")[-1] if "-" in v.id else v.id,
            target_text=v.target_text,
            phonetic=v.phonetic,
            type_target=v.type_target,
            meaning=v.meaning,
            example=v.example,
            difficulty=v.difficulty,
            stroke_gesture=v.stroke_gesture
        )
        for v in entity.vocabulary_items
    ]

    quiz_items = []
    for q in entity.quiz_items:
        try:
            options = json.loads(q.options_json)
        except Exception:
            options = ["A", "B", "C", "D"]
        
        quiz_items.append(
            QuizItem(
                id=q.id.split("-")[-1] if "-" in q.id else q.id,
                question=q.question,
                options=options,
                correct_index=q.correct_index,
                explanation=q.explanation,
                points=q.points
            )
        )

    return LearningPackage(
        package_id=entity.package_id,
        title=entity.title,
        source_filename=entity.source_filename,
        created_at=entity.created_at.isoformat() if entity.created_at else datetime.utcnow().isoformat(),
        vocabulary_deck=VocabularyDeck(
            id=f"deck-{entity.package_id}",
            title=entity.title,
            description=entity.description or "",
            target_language=entity.target_language,
            items=vocab_items
        ),
        quiz_deck=QuizDeck(
            id=f"quiz-{entity.package_id}",
            title=f"Đấu Trường Quiz: {entity.title}",
            description=entity.description or "",
            items=quiz_items
        )
    )

@router.get("/decks", response_model=List[LearningPackage])
async def list_decks(db: Session = Depends(get_db)):
    """Lấy danh sách tất cả các bộ bài học từ Database"""
    packages = db.query(PackageEntity).order_by(PackageEntity.created_at.desc()).all()
    return [entity_to_pydantic(p) for p in packages]

@router.get("/decks/{deck_id}", response_model=LearningPackage)
async def get_deck(deck_id: str, db: Session = Depends(get_db)):
    """Lấy chi tiết một bộ bài học theo ID"""
    package = db.query(PackageEntity).filter(PackageEntity.package_id == deck_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Không tìm thấy bộ từ vựng")
    return entity_to_pydantic(package)

@router.post("/decks", response_model=LearningPackage)
async def save_deck(
    package: LearningPackage,
    current_user: Optional[UserEntity] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Lưu bộ bài học mới hoặc cập nhật bài học vào Database"""
    existing = db.query(PackageEntity).filter(PackageEntity.package_id == package.package_id).first()

    user_id = current_user.id if current_user else None

    if existing:
        existing.title = package.title
        existing.source_filename = package.source_filename
        existing.target_language = package.vocabulary_deck.target_language
        existing.description = package.vocabulary_deck.description
        existing.updated_at = datetime.utcnow()
        if user_id:
            existing.user_id = user_id

        # Xóa các item cũ để thay bằng item mới cập nhật
        db.query(VocabularyItemEntity).filter(VocabularyItemEntity.package_id == package.package_id).delete()
        db.query(QuizItemEntity).filter(QuizItemEntity.package_id == package.package_id).delete()
    else:
        existing = PackageEntity(
            package_id=package.package_id,
            user_id=user_id,
            title=package.title,
            source_filename=package.source_filename,
            target_language=package.vocabulary_deck.target_language,
            description=package.vocabulary_deck.description,
            is_public=True,
            created_at=datetime.utcnow()
        )
        db.add(existing)

    # Thêm Vocabulary Items
    for idx, v in enumerate(package.vocabulary_deck.items):
        v_entity = VocabularyItemEntity(
            id=f"{package.package_id}-{v.id}",
            package_id=package.package_id,
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

    # Thêm Quiz Items
    for idx, q in enumerate(package.quiz_deck.items):
        q_entity = QuizItemEntity(
            id=f"{package.package_id}-{q.id}",
            package_id=package.package_id,
            question=q.question,
            options_json=json.dumps(q.options, ensure_ascii=False),
            correct_index=q.correct_index,
            explanation=q.explanation,
            points=q.points,
            order_index=idx
        )
        db.add(q_entity)

    db.commit()
    db.refresh(existing)
    return entity_to_pydantic(existing)
