import os
import json
import re
from typing import Optional, Dict, Any
from ...core.config import settings

class GeminiClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self._configured = False
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._configured = True
            except Exception as e:
                print(f"[GeminiClient] Configuration warning: {e}")

    def generate_json(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        if not self._configured and not self.api_key:
            raise ValueError("GEMINI_API_KEY chưa được thiết lập!")

        import google.generativeai as genai
        import urllib.request

        models_list = [
            "gemini-3.1-flash-lite",
            "gemini-3.8-flash",
            "gemini-3.5-flash",
            "gemini-3-flash-preview",
            "gemini-flash-latest"
        ]

        text = None

        # 1. Thử qua SDK
        if self._configured:
            for m_name in models_list:
                try:
                    model = genai.GenerativeModel(
                        model_name=m_name,
                        generation_config={"response_mime_type": "application/json"}
                    )
                    res = model.generate_content(prompt)
                    if res and res.text:
                        text = res.text.strip()
                        break
                except Exception:
                    continue

        # 2. Nếu SDK không thành công (hoặc model mới chưa hỗ trợ SDK cũ), gọi trực tiếp REST API
        if not text and self.api_key:
            for m_name in models_list:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{m_name}:generateContent?key={self.api_key}"
                    body = {
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"responseMimeType": "application/json"}
                    }
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(body).encode("utf-8"),
                        headers={"Content-Type": "application/json"}
                    )
                    with urllib.request.urlopen(req, timeout=20) as resp:
                        data = json.loads(resp.read().decode())
                        candidate_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
                        if candidate_text:
                            text = candidate_text.strip()
                            break
                except Exception:
                    continue

        if not text:
            raise ValueError("Không thể sinh nội dung từ Gemini API với các model hiện hành")
        
        # Clean potential markdown wrapping if returned
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        return json.loads(text)
