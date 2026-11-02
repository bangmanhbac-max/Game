from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from ...services.ai.vlm_engine import VLMEngine
from ...models.document import LearningPackage

router = APIRouter()
vlm_engine = VLMEngine()

class GenerateRequest(BaseModel):
    raw_text: str
    filename: Optional[str] = None
    api_key: Optional[str] = None
    custom_prompt: Optional[str] = None

@router.post("/generate", response_model=LearningPackage)
async def generate_learning_content(request: GenerateRequest):
    # Kích hoạt VLM Decoder & Token Disentangler để phân tích và chuẩn hóa
    package = vlm_engine.process_text(
        raw_text=request.raw_text,
        filename=request.filename or "Tài liệu tùy chỉnh",
        user_api_key=request.api_key,
        custom_prompt=request.custom_prompt
    )
    return package


