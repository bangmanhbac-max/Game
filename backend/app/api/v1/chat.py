import os
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ...core.config import settings
from ...db.session import get_db
from ...db.models import ChatMessageEntity, UserEntity

router = APIRouter()

class SendMessageRequest(BaseModel):
    channel: str = "ai_copilot" # 'ai_copilot' hoặc 'world_chat'
    content: str
    sender_name: Optional[str] = "Người học"
    sender_avatar: Optional[str] = "iron-man"

@router.get("/chat/messages")
def get_chat_messages(channel: str = "world_chat", limit: int = 50, db: Session = Depends(get_db)):
    """Lấy danh sách tin nhắn theo kênh (world_chat hoặc ai_copilot)"""
    msgs = db.query(ChatMessageEntity).filter(
        ChatMessageEntity.channel == channel
    ).order_by(desc(ChatMessageEntity.created_at)).limit(limit).all()
    
    # Đảo lại thứ tự thời gian tăng dần
    return [
        {
            "id": m.id,
            "channel": m.channel,
            "role": m.role,
            "sender_name": m.sender_name,
            "sender_avatar": m.sender_avatar,
            "content": m.content,
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in reversed(msgs)
    ]

@router.post("/chat/messages")
def post_chat_message(
    req: SendMessageRequest,
    x_gemini_key: Optional[str] = Header(None, alias="X-Gemini-Key"),
    db: Session = Depends(get_db)
):
    """Gửi tin nhắn vào kênh thế giới hoặc trò chuyện trực tiếp với AI Copilot"""
    content = req.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Nội dung tin nhắn không được để trống")

    # 1. Lưu tin nhắn của người dùng
    user_msg = ChatMessageEntity(
        channel=req.channel,
        sender_name=req.sender_name or "Người học",
        sender_avatar=req.sender_avatar or "iron-man",
        role="user",
        content=content,
        created_at=datetime.utcnow()
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # 2. Nếu là kênh AI Copilot, tạo phản hồi từ AI
    ai_reply_item = None
    if req.channel == "ai_copilot":
        api_key = (x_gemini_key or settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")).strip()
        reply_text = ""
        api_error_detail = ""

        # Lấy lịch sử hội thoại 6 lượt gần nhất để AI nhớ ngữ cảnh
        recent_msgs = db.query(ChatMessageEntity).filter(
            ChatMessageEntity.channel == "ai_copilot"
        ).order_by(desc(ChatMessageEntity.created_at)).limit(8).all()
        
        history_context = []
        for m in reversed(recent_msgs[:-1]):
            r = "Người dùng" if m.role == "user" else "AI Copilot"
            history_context.append(f"{r}: {m.content}")
        
        history_str = "\n".join(history_context)

        system_instruction = (
            "Bạn là JARVIS AI Copilot - Trợ lý AI Giáo dục Gamification thông minh của hệ thống AI EduPlay (Phiên bản Avengers 4K). "
            "Nhiệm vụ của bạn:\n"
            "1. Phân tích chi tiết chữ Hán (tiếng Trung HSK): chỉ rõ chữ cứng (Hanzi), bộ thủ cấu thành, số nét bút, Pinyin chuẩn và nghĩa tiếng Việt sâu sắc.\n"
            "2. Hướng dẫn các mini-game: Bắn Gà Luyện Gõ Stark Nano-Armor, Magic Touch Doctor Strange (vẽ nét phép — | / \\ V ^ O ⚡), "
            "Speed Quiz Đấu Trường, Trốn Thoát Rừng Ma Granny 3D (tìm chữ cứng mở cổng thoát hiểm), và Flashcard 3D.\n"
            "3. Giải thích cơ chế VLM xử lý chữ dính chùm, nhận diện cấu trúc tài liệu.\n"
            "4. Định dạng câu trả lời bằng Markdown đẹp mắt, có gạch đầu dòng, icon sinh động và sư phạm, thân thiện."
        )

        if api_key:
            # Phương án A: Thử dùng Google Generative AI SDK với các model đời mới nhất
            candidate_models = [
                "gemini-2.5-flash",
                "gemini-2.0-flash",
                "gemini-1.5-flash",
                "gemini-1.5-pro",
                "gemini-3.8-flash",
                "gemini-3.5-flash",
                "gemini-3.1-flash-lite",
                "gemini-3-flash-preview",
                "gemini-flash-latest",
            ]
            for model_name in candidate_models:
                try:
                    import google.generativeai as genai
                    genai.configure(api_key=api_key)
                    model = genai.GenerativeModel(
                        model_name=model_name,
                        system_instruction=system_instruction
                    )
                    full_prompt = (
                        f"Lịch sử trò chuyện trước đó:\n{history_str}\n\n"
                        f"Câu hỏi hiện tại của người học: {content}"
                    ) if history_str else content
                    
                    res = model.generate_content(full_prompt)
                    if res and res.text:
                        reply_text = res.text.strip()
                        break
                except Exception as e:
                    api_error_detail = str(e)
                    print(f"[AI Copilot] Model {model_name} failed: {e}")

            # Phương án B: Nếu SDK lỗi, thử gọi trực tiếp REST API qua urllib với gemini-3.8-flash
            if not reply_text:
                for rest_model in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-3.8-flash", "gemini-3.5-flash", "gemini-3-flash-preview"]:
                    try:
                        import json
                        import urllib.request
                        url = f"https://generativelanguage.googleapis.com/v1beta/models/{rest_model}:generateContent?key={api_key}"
                        payload = {
                            "contents": [
                                {
                                    "role": "user",
                                    "parts": [
                                        {"text": f"{system_instruction}\n\nLịch sử:\n{history_str}\n\nNgười dùng: {content}"}
                                    ]
                                }
                            ]
                        }
                        req_data = json.dumps(payload).encode('utf-8')
                        request = urllib.request.Request(
                            url,
                            data=req_data,
                            headers={"Content-Type": "application/json"}
                        )
                        with urllib.request.urlopen(request, timeout=12) as response:
                            if response.status == 200:
                                res_json = json.loads(response.read().decode('utf-8'))
                                candidates = res_json.get("candidates", [])
                                if candidates:
                                    parts = candidates[0].get("content", {}).get("parts", [])
                                    if parts:
                                        reply_text = parts[0].get("text", "").strip()
                                        if reply_text:
                                            break
                    except Exception as e:
                        api_error_detail = str(e)
                        print(f"[AI Copilot] REST API {rest_model} fallback error: {e}")

        # Xử lý trường hợp không có kết quả từ API
        if not reply_text:
            lower_q = content.lower()
            
            # Nếu người dùng gửi trực tiếp mã API key
            if content.startswith("AIzaSy") and len(content) > 30:
                reply_text = (
                    "🎉 **Đã nhận diện Gemini API Key!**\n\n"
                    "Bạn đã gửi mã khóa API trực tiếp. Hãy bấm vào biểu tượng **🔑 Cấu hình API** trên thanh tiêu đề hộp chat hoặc nút chìa khóa trên Navbar để lưu cố định vào trình duyệt, hệ thống sẽ kích hoạt AI toàn năng ngay tức thì!"
                )
            elif not api_key:
                # Thông báo chưa có API key kèm câu trả lời tri thức tức thì
                domain_help = ""
                if "hsk" in lower_q or "tiếng trung" in lower_q or "chữ hán" in lower_q or "nét" in lower_q or "chữ cứng" in lower_q:
                    domain_help = (
                        "💡 **Kiến thức nhanh về Chữ Cứng & Nét Bút**:\n"
                        "- Mỗi chữ Hán cấu thành từ các nét gốc: Ngang (-), Sổ (|), Phẩy (/), Mác (\\), Hất, Gập.\n"
                        "- Ví dụ chữ **'你' (nǐ - Bạn)**: gồm bộ Nhân đứng (亻) và chữ Nhĩ (尔), tổng 7 nét.\n"
                        "- Ví dụ chữ **'好' (hǎo - Tốt/Đẹp)**: gồm bộ Nữ (女) và bộ Tử (子), tượng trưng cho người mẹ bồng con, tổng 6 nét!\n"
                        "- Trong **Rừng Ma Granny 3D**, bạn hãy tìm đúng các mảnh chữ này để mở cổng thoát hiểm."
                    )
                elif "granny" in lower_q or "game ma" in lower_q or "rừng" in lower_q:
                    domain_help = (
                        "👻 **Mẹo Chơi Game Ma Granny 3D (3 Tầng Rừng Rậm)**:\n"
                        "- Bấm `F` để bật/tắt đèn pin (nhớ chú ý lượng pin).\n"
                        "- Di chuyển bằng `W, A, S, D`, giữ `Shift` để chạy nhanh khi máy đo nhịp tim (màu đỏ) đập dồn dập.\n"
                        "- Khi thấy mảnh chữ Hán bay phát sáng giữa rừng, đến gần và nhấn `E` để thu thập."
                    )
                else:
                    domain_help = (
                        "💡 **Gợi ý**: Bạn có thể hỏi tôi về bóc tách cấu tạo chữ Hán, số nét, Pinyin, nghĩa từ vựng, mẹo chơi game hoặc cơ chế VLM!"
                    )

                reply_text = (
                    "⚠️ **Chưa kết nối Gemini API Key**\n\n"
                    "Hiện tại Chatbot đang hoạt động ở chế độ *Offline cục bộ*. Để kích hoạt trí tuệ nhân tạo Gemini 1.5/2.0 giải đáp trực tiếp theo thời gian thực:\n"
                    "1. Bấm vào biểu tượng **🔑 (API Key)** ngay trên góc phải thanh tiêu đề hộp chat.\n"
                    "2. Nhập API Key miễn phí lấy từ [Google AI Studio](https://aistudio.google.com/).\n"
                    "3. Bấm **Lưu & Kết Nối** để trải nghiệm AI thông minh nhất!\n\n"
                    f"---\n{domain_help}"
                )
            else:
                # Có API key nhưng gọi lỗi (ví dụ key sai hoặc hết quota)
                reply_text = (
                    f"⚠️ **Không thể kết nối đến máy chủ Gemini API**\n\n"
                    f"Chi tiết: `{api_error_detail or 'Lỗi xác thực hoặc hết hạn mức Quota'}`\n\n"
                    "👉 **Cách khắc phục**:\n"
                    "- Kiểm tra xem mã API Key có bị thừa khoảng trắng hay không.\n"
                    "- Đảm bảo API Key của bạn lấy từ [Google AI Studio](https://aistudio.google.com/) và đã bật quyền truy cập cho model Gemini 1.5 Flash."
                )

        ai_msg = ChatMessageEntity(
            channel="ai_copilot",
            sender_name="JARVIS AI Copilot",
            sender_avatar="doctor-strange",
            role="assistant",
            content=reply_text,
            created_at=datetime.utcnow()
        )
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)
        ai_reply_item = {
            "id": ai_msg.id,
            "channel": ai_msg.channel,
            "role": ai_msg.role,
            "sender_name": ai_msg.sender_name,
            "sender_avatar": ai_msg.sender_avatar,
            "content": ai_msg.content,
            "created_at": ai_msg.created_at.isoformat()
        }

    return {
        "status": "success",
        "user_message": {
            "id": user_msg.id,
            "channel": user_msg.channel,
            "role": user_msg.role,
            "sender_name": user_msg.sender_name,
            "sender_avatar": user_msg.sender_avatar,
            "content": user_msg.content,
            "created_at": user_msg.created_at.isoformat()
        },
        "ai_reply": ai_reply_item
    }
