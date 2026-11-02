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
        if not self._configured:
            raise ValueError("GEMINI_API_KEY chưa được thiết lập!")

        import google.generativeai as genai
        response = None
        for m_name in ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"]:
            try:
                model = genai.GenerativeModel(
                    model_name=m_name,
                    generation_config={"response_mime_type": "application/json"}
                )
                response = model.generate_content(prompt)
                if response and response.text:
                    break
            except Exception:
                continue

        if not response or not response.text:
            raise ValueError("Không thể sinh nội dung từ Gemini API với các model hiện hành")
        text = response.text.strip()
        
        # Clean potential markdown wrapping if returned
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        return json.loads(text)
