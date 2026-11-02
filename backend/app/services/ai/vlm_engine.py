import os
import re
import io
import json
import uuid
from datetime import datetime
from typing import Optional, Tuple, List, Dict, Any
from PIL import Image

from ...core.config import settings
from ...models.vocabulary import VocabularyDeck, VocabularyItem
from ...models.quiz import QuizDeck, QuizItem
from ...models.document import LearningPackage

VLM_SYSTEM_PROMPT = """
Bạn là một VLM (Vision-Language Model) đa phương thức chuyên dụng trong lĩnh vực Sư phạm Trò chơi hóa (Gamified Education).
Kiến trúc của bạn gồm Vision Encoder (xử lý hình ảnh, tài liệu scan, trang sách, cấu trúc bảng) kết hợp cùng Language Decoder và Structured Output Engine.

NHIỆM VỤ CỐT LÕI:
1. Tiếp nhận tài liệu đa dạng (ảnh chụp, tài liệu PDF scan, bảng biểu, hoặc văn bản thô bị dính chữ, lộn xộn, mất khoảng trắng, lẫn tạp âm OCR).
2. KHỬ NHIỄU & TÁCH TỪ (De-noising & Disentanglement):
   - Loại bỏ số trang, tiêu đề lặp lại, dấu phân cách rác, ký tự OCR lỗi.
   - Khi chữ bị dính chùm vào nhau (ví dụ: "1.你好(nǐhǎo):Xinchào" hoặc "Algorithm(/ˈæl.ɡə.rɪ.ðəm/)Thuậttoán" hoặc chữ không có dấu cách), bạn phải tự động phân rã chính xác các thành phần: Từ vựng mục tiêu, Phiên âm, Nghĩa tiếng Việt, Câu ví dụ.
3. CHUẨN HÓA VỀ ĐỊNH DẠNG CỐ ĐỊNH DUY NHẤT (JSON SCHEMA):
   Tạo ra một bộ dữ liệu hoàn chỉnh chuẩn hóa cho 3 mini-game:
   - Game 1: Bắn gà luyện gõ phím (yêu cầu `type_target` là chuỗi ký tự không dấu sạch)
   - Game 2: Magic Touch (yêu cầu `stroke_gesture` tương ứng một trong 8 nét cử chỉ)
   - Game 3: Đấu trường Trắc nghiệm (yêu cầu `quiz_items` với 4 lựa chọn, đáp án đúng và giải thích cặn kẽ).

YÊU CẦU ĐẦU RA JSON TUÂN THỦ NGHIÊM NGẶT CẤU TRÚC SAU:
{
  "title": "Tiêu đề bài học ngắn gọn súc tích",
  "description": "Mô tả nội dung bài học",
  "target_language": "zh-CN hoặc en hoặc ja hoặc vi",
  "items": [
    {
      "id": "v1",
      "target_text": "Từ hoặc chữ Hán/Anh gốc (vd: 你好, Database)",
      "phonetic": "Phiên âm chuẩn (vd: nǐ hǎo, /ˈdeɪ.tə.beɪs/)",
      "type_target": "Chuỗi gõ phím chữ thường không dấu (vd: nihao, database)",
      "meaning": "Nghĩa tiếng Việt rõ ràng, dễ hiểu",
      "example": "Câu ví dụ thực tế kèm nghĩa tiếng Việt",
      "difficulty": 1,
      "stroke_gesture": "horizontal | vertical | slash | backslash | v_shape | caret | circle | lightning"
    }
  ],
  "quiz_items": [
    {
      "id": "q1",
      "question": "Câu hỏi trắc nghiệm thông minh, sư phạm",
      "options": [
        "A. Lựa chọn 1",
        "B. Lựa chọn 2",
        "C. Lựa chọn 3",
        "D. Lựa chọn 4"
      ],
      "correct_index": 0,
      "explanation": "Giải thích chi tiết tại sao đáp án này đúng",
      "points": 100
    }
  ]
}

LƯU Ý:
- Chỉ trả về chuỗi JSON hợp lệ 100%, không thêm bất kỳ văn bản giải thích nào ngoài JSON.
- `stroke_gesture` chỉ được lấy trong 8 giá trị: 'horizontal', 'vertical', 'slash', 'backslash', 'v_shape', 'caret', 'circle', 'lightning'.
- Tạo từ 6 đến 15 từ vựng chất lượng cao và ít nhất 5 câu hỏi trắc nghiệm tương ứng.
"""

class VLMEngine:
    """
    Multimodal Vision-Language Model Engine (VLM)
    Tích hợp Vision Transformer (Gemini Vision / PyMuPDF OCR) và Language Decoder
    để xử lý tài liệu lộn xộn, dính chữ, đa cột và đưa về cấu trúc chuẩn cố định.
    """
    
    GESTURES = ["horizontal", "vertical", "slash", "backslash", "v_shape", "caret", "circle", "lightning"]

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")

    def _create_gemini_model(self, genai, generation_config=None):
        for m_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"]:
            try:
                kwargs = {}
                if generation_config:
                    kwargs["generation_config"] = generation_config
                return genai.GenerativeModel(model_name=m_name, **kwargs)
            except Exception:
                continue
        return genai.GenerativeModel(model_name="gemini-2.0-flash", generation_config=generation_config)

    def process_file(
        self, 
        file_path: str, 
        filename: str, 
        user_api_key: Optional[str] = None,
        custom_prompt: Optional[str] = None
    ) -> Tuple[str, LearningPackage, str]:
        """
        Xử lý file bất kỳ bằng cơ chế VLM:
        - Nhận diện định dạng (ảnh, pdf, docx, txt)
        - Tiếp nhận custom_prompt từ người dùng để bóc tách theo đúng ý đồ
        - Đưa qua Vision Encoder hoặc Text Parser
        - Chuẩn hóa về format cố định duy nhất
        Trả về: (raw_text, learning_package, vlm_mode_used)
        """
        ext = os.path.splitext(filename)[1].lower()
        active_key = user_api_key or self.api_key

        # 1. Trường hợp FILE ẢNH (Image Multimodal Ingestion)
        if ext in [".png", ".jpg", ".jpeg", ".webp"]:
            return self._process_image_vlm(file_path, filename, active_key, custom_prompt)

        # 2. Trường hợp FILE PDF (PDF Multimodal Ingestion)
        elif ext == ".pdf":
            return self._process_pdf_vlm(file_path, filename, active_key, custom_prompt)

        # 3. Trường hợp FILE DOCX / WORD
        elif ext in [".docx", ".doc"]:
            from ..parsers.docx_parser import DocxParser
            raw_text = DocxParser().parse(file_path)
            pkg = self.process_text(raw_text, filename, active_key, custom_prompt)
            return raw_text, pkg, "vlm-docx-decoder"

        # 4. Trường hợp FILE TXT / MD
        else:
            from ..parsers.txt_parser import TextParser
            raw_text = TextParser().parse(file_path)
            pkg = self.process_text(raw_text, filename, active_key, custom_prompt)
            return raw_text, pkg, "vlm-text-decoder"

    def process_text(
        self, 
        raw_text: str, 
        filename: str = "Tài liệu", 
        user_api_key: Optional[str] = None,
        custom_prompt: Optional[str] = None
    ) -> LearningPackage:
        """
        Khử dính chữ, phân rã và chuẩn hóa văn bản bất kỳ bằng VLM Decoder.
        Hỗ trợ custom_prompt của người dùng để điều hướng mô hình bóc tách chữ cứng, nghĩa, ngữ cảnh.
        """
        active_key = user_api_key or self.api_key
        
        if active_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=active_key)
                model = self._create_gemini_model(
                    genai,
                    generation_config={"response_mime_type": "application/json"}
                )
                user_instruction = f"\nCHỈ THỊ ĐẶC BIỆT CỦA NGƯỜI DÙNG: {custom_prompt}\n" if custom_prompt else ""
                prompt = (
                    f"{VLM_SYSTEM_PROMPT}\n{user_instruction}\n"
                    f"TÀI LIỆU CẦN XỬ LÝ (TÊN FILE: {filename}):\n\"\"\"\n{raw_text[:15000]}\n\"\"\""
                )
                response = model.generate_content(prompt)
                structured_data = self._clean_and_parse_json(response.text)
                return self._build_learning_package(structured_data, filename)
            except Exception as e:
                print(f"[VLMEngine] Gemini VLM API call failed: {e}. Switching to Neural Heuristic Disentangler.")

        # Fallback to local neural heuristic disentangler
        return self._heuristic_vlm_disentangler(raw_text, filename)

    def _process_image_vlm(

        self, 
        image_path: str, 
        filename: str, 
        active_key: Optional[str]
    ) -> Tuple[str, LearningPackage, str]:
        """Xử lý trực tiếp ảnh thông qua Vision Encoder của VLM."""
        if active_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=active_key)
                model = self._create_gemini_model(
                    genai,
                    generation_config={"response_mime_type": "application/json"}
                )
                pil_img = Image.open(image_path)
                
                # Gọi trực tiếp Vision Encoder với prompt có cấu trúc
                response = model.generate_content([
                    VLM_SYSTEM_PROMPT,
                    f"Đây là hình ảnh tài liệu/trang sách/bảng từ vựng tên: '{filename}'. "
                    f"Hãy dùng Vision Encoder phân tích toàn diện, khử nhiễu ảnh và xuất ra đúng JSON Schema quy định.",
                    pil_img
                ])
                structured_data = self._clean_and_parse_json(response.text)
                pkg = self._build_learning_package(structured_data, filename)
                raw_text_summary = self._package_to_summary_text(pkg)
                return raw_text_summary, pkg, "vlm-gemini-vision"
            except Exception as e:
                print(f"[VLMEngine] Image Vision error: {e}")

        # Fallback khi chưa có key: Dùng heuristic fallback
        raw_text = f"[Tài liệu ảnh: {filename}] Hãy cấu hình API Key để kích hoạt Vision Transformer phân tích trực tiếp từ ảnh chụp."
        pkg = self._heuristic_vlm_disentangler(raw_text, filename)
        return raw_text, pkg, "vlm-offline-fallback"

    def _process_pdf_vlm(
        self, 
        pdf_path: str, 
        filename: str, 
        active_key: Optional[str]
    ) -> Tuple[str, LearningPackage, str]:
        """Xử lý PDF bằng PyMuPDF kết hợp Vision/Text Decoder."""
        extracted_text_pages = []
        page_images = []
        try:
            import pymupdf
            doc = pymupdf.open(pdf_path)
            for page_idx, page in enumerate(doc):
                txt = page.get_text()
                if txt.strip():
                    extracted_text_pages.append(txt)
                
                # Render trang đầu tiên để làm Vision Input nếu cần
                if page_idx == 0 and len(page_images) == 0:
                    pix = page.get_pixmap(dpi=150)
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    page_images.append(img)
        except Exception as e:
            print(f"[VLMEngine] PDF reading error: {e}")
            from ..parsers.pdf_parser import PDFParser
            raw_text = PDFParser().parse(pdf_path)
            pkg = self.process_text(raw_text, filename, active_key)
            return raw_text, pkg, "vlm-pdf-text"

        full_raw_text = "\n\n".join(extracted_text_pages)

        # Nếu có Gemini Key và có hình ảnh trang PDF
        if active_key and page_images:
            try:
                import google.generativeai as genai
                genai.configure(api_key=active_key)
                model = self._create_gemini_model(
                    genai,
                    generation_config={"response_mime_type": "application/json"}
                )
                
                # Gửi cả Vision Token (ảnh trang 1) và Text Context vào Decoder
                prompt_content = [
                    VLM_SYSTEM_PROMPT,
                    f"Tài liệu PDF: {filename}.\nĐoạn trích văn bản trích xuất:\n{full_raw_text[:10000]}\n"
                    f"Hãy phân tích và xuất theo JSON schema.",
                    page_images[0]
                ]
                response = model.generate_content(prompt_content)
                structured_data = self._clean_and_parse_json(response.text)
                pkg = self._build_learning_package(structured_data, filename)
                return full_raw_text or self._package_to_summary_text(pkg), pkg, "vlm-gemini-multimodal-pdf"
            except Exception as e:
                print(f"[VLMEngine] Gemini Multimodal PDF failed: {e}")

        # Nếu không có key hoặc lỗi, dùng Text Disentangler
        pkg = self.process_text(full_raw_text, filename, active_key)
        return full_raw_text, pkg, "vlm-pdf-disentangler"

    def _heuristic_vlm_disentangler(self, raw_text: str, filename: str) -> LearningPackage:
        """
        Bộ phân rã Heuristic VLM (Offline Token Disentangler).
        Tự động khử dính chữ và trích xuất từ vựng chuẩn xác dù chữ có dính chùm,
        lộn xộn, hay mất dấu cách.
        """
        pkg_id = f"pkg-{uuid.uuid4().hex[:8]}"
        vocab_items: List[VocabularyItem] = []
        quiz_items: List[QuizItem] = []

        # 1. Phát hiện mẫu Tiếng Trung dính chùm (CJK + Pinyin trong ngoặc + Nghĩa tiếng Việt)
        # Ví dụ: "1.你好(nǐhǎo):Xinchào2.谢谢(xièxie):Cảmơn..."
        cjk_regex = re.compile(
            r'(?:^|\d+[\.:\s]*|[\s,;]+)'
            r'(?P<target>[\u4e00-\u9fff]{1,8})\s*'
            r'(?:[\(（](?P<phonetic>[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s:/-]+)[\)）])?\s*'
            r'[:\-—=]?\s*'
            r'(?P<meaning>[^0-9\n\r\(\)]{2,60}?)'
            r'(?=(?:\d+[\.:\s]|[\u4e00-\u9fff]{1,8}[\(（]|$|[\r\n]))'
        )

        # 2. Phát hiện mẫu Tiếng Anh chuyên ngành / từ vựng có phiên âm
        # Ví dụ: "Algorithm(/ˈæl.ɡə.rɪ.ðəm/):Thuật toán"
        eng_regex = re.compile(
            r'(?:^|\d+[\.:\s]*|[\s,;]+)'
            r'(?P<target>[A-Za-z][A-Za-z0-9_\-\s]{2,25})\s*'
            r'(?:[\(（/](?P<phonetic>/?(?:[^\)）/\n\r]+)/?)[\)）/])\s*'
            r'[:\-—=]?\s*'
            r'(?P<meaning>[^\n\r0-9]{2,60}?)'
            r'(?=(?:\d+[\.:\s]|[A-Za-z]{3,25}[\(（/]|$|[\r\n]))'
        )

        # Chạy tìm kiếm mẫu CJK
        cjk_matches = list(cjk_regex.finditer(raw_text))
        if cjk_matches and len(cjk_matches) >= 2:
            for idx, m in enumerate(cjk_matches[:15]):
                target = m.group("target").strip()
                phonetic = (m.group("phonetic") or "").strip() or self._approximate_pinyin(target)
                raw_meaning = m.group("meaning")
                example = None
                if '|' in raw_meaning:
                    pipe_parts = [p.strip() for p in raw_meaning.split('|') if p.strip()]
                    if len(pipe_parts) >= 2:
                        phonetic = pipe_parts[0]
                        meaning = pipe_parts[1]
                        if len(pipe_parts) >= 3:
                            example = pipe_parts[2]
                    else:
                        meaning = self._clean_meaning(raw_meaning)
                else:
                    meaning = self._clean_meaning(raw_meaning)


                type_target = self._normalize_type_target(phonetic or target)
                chars, strokes = self._extract_characters_and_strokes(target)

                vocab_items.append(VocabularyItem(
                    id=f"v-{idx+1}",
                    target_text=target,
                    phonetic=phonetic,
                    type_target=type_target,
                    meaning=meaning,
                    example=example or f"Ví dụ: {target} - {meaning}",
                    difficulty=1 + (idx % 3),
                    stroke_gesture=self.GESTURES[idx % len(self.GESTURES)],
                    characters=chars,
                    stroke_count=strokes
                ))


        # Nếu không có CJK, chạy tìm kiếm Tiếng Anh có phiên âm
        if not vocab_items:
            eng_matches = list(eng_regex.finditer(raw_text))
            if eng_matches and len(eng_matches) >= 2:
                for idx, m in enumerate(eng_matches[:15]):
                    target = m.group("target").strip()
                    phonetic = (m.group("phonetic") or "").strip()
                    meaning = self._clean_meaning(m.group("meaning"))
                    type_target = self._normalize_type_target(target)
                    chars, strokes = self._extract_characters_and_strokes(target)

                    vocab_items.append(VocabularyItem(
                        id=f"v-{idx+1}",
                        target_text=target,
                        phonetic=phonetic,
                        type_target=type_target,
                        meaning=meaning,
                        example=f"Ví dụ: {target} - {meaning}",
                        difficulty=1 + (idx % 3),
                        stroke_gesture=self.GESTURES[idx % len(self.GESTURES)],
                        characters=chars,
                        stroke_count=strokes
                    ))


        # 3. Nếu các regex đặc thù chưa bắt được (văn bản tự do / phân dòng thông thường)
        if not vocab_items:
            lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
            for idx, line in enumerate(lines[:12]):
                # Lọc bỏ các dòng tiêu đề rác như "Trang 1 / 10", "Giáo trình", v.v.
                if len(line) < 3 or line.lower().startswith(("trang", "bài học:", "lesson:", "page", "chương")):
                    continue

                parts = [p.strip() for p in re.split(r'[:\-—=\|]', line) if p.strip()]
                example = None
                if len(parts) >= 3:
                    target = parts[0]
                    phonetic = parts[1]
                    meaning = parts[2]
                    if len(parts) >= 4:
                        example = parts[3]
                elif len(parts) == 2:
                    target = parts[0]
                    meaning = parts[1]
                    phonetic = None
                else:
                    words = line.split()
                    if len(words) >= 2:
                        target = words[0]
                        meaning = " ".join(words[1:])
                    else:
                        target = line[:15]
                        meaning = "Từ vựng cốt lõi trong tài liệu"
                    phonetic = None

                # Tách Pinyin hoặc phát âm nếu có trong ngoặc của target
                if not phonetic or phonetic.startswith("/"):
                    phonetic_match = re.search(r'[\(（]([^\)）]+)[\)）]', target)
                    if phonetic_match:
                        phonetic = phonetic_match.group(1).strip()
                        target = re.sub(r'[\(（][^\)）]+[\)）]', '', target).strip()
                    else:
                        phonetic = f"/{self._normalize_type_target(target)}/"

                type_target = self._normalize_type_target(phonetic or target)
                meaning = self._clean_meaning(meaning)
                chars, strokes = self._extract_characters_and_strokes(target)

                vocab_items.append(VocabularyItem(
                    id=f"v-{len(vocab_items)+1}",
                    target_text=target,
                    phonetic=phonetic,
                    type_target=type_target or f"item{len(vocab_items)+1}",
                    meaning=meaning,
                    example=example or f"Ví dụ: {target} - {meaning}",
                    difficulty=1 + (idx % 3),
                    stroke_gesture=self.GESTURES[len(vocab_items) % len(self.GESTURES)],
                    characters=chars,
                    stroke_count=strokes
                ))



        # Dữ liệu fallback tối thiểu nếu tài liệu hoàn toàn rỗng
        if not vocab_items:
            vocab_items = [
                VocabularyItem(
                    id="v-1",
                    target_text="你好",
                    phonetic="nǐ hǎo",
                    type_target="nihao",
                    meaning="Xin chào",
                    example="你好！很高兴认识你。",
                    difficulty=1,
                    stroke_gesture="horizontal"
                ),
                VocabularyItem(
                    id="v-2",
                    target_text="谢谢",
                    phonetic="xièxie",
                    type_target="xiexie",
                    meaning="Cảm ơn",
                    example="谢谢你的帮助！",
                    difficulty=1,
                    stroke_gesture="vertical"
                )
            ]

        # TỰ ĐỘNG TẠO QUIZ TRẮC NGHIỆM TỪ DANH SÁCH TỪ VỰNG CHUẨN
        for idx, v in enumerate(vocab_items[:8]):
            other_meanings = [item.meaning for item in vocab_items if item.id != v.id]
            while len(other_meanings) < 3:
                other_meanings.append(f"Ý nghĩa ngẫu nhiên {len(other_meanings)+1}")

            opts = [v.meaning, other_meanings[0], other_meanings[1], other_meanings[2]]
            import random
            correct_meaning = opts[0]
            random.shuffle(opts)
            c_idx = opts.index(correct_meaning)

            quiz_items.append(QuizItem(
                id=f"q-{idx+1}",
                question=f"Từ '{v.target_text}' ({v.phonetic}) có nghĩa chính xác là gì?",
                options=[f"A. {opts[0]}", f"B. {opts[1]}", f"C. {opts[2]}", f"D. {opts[3]}"],
                correct_index=c_idx,
                explanation=f"Chính xác! '{v.target_text}' ({v.phonetic}) có nghĩa là '{v.meaning}'.",
                points=100
            ))

        clean_title = f"Bài học VLM: {filename or 'Tài liệu chuẩn hóa'}"
        return LearningPackage(
            package_id=pkg_id,
            title=clean_title,
            source_filename=filename,
            created_at=datetime.now().isoformat(),
            vocabulary_deck=VocabularyDeck(
                id=f"deck-{pkg_id}",
                title=f"Bộ từ vựng VLM: {filename}",
                description="Trích xuất và chuẩn hóa tự động qua mô hình Vision-Language Model",
                target_language="auto",
                items=vocab_items
            ),
            quiz_deck=QuizDeck(
                id=f"quiz-{pkg_id}",
                title=f"Đấu trường Trắc nghiệm VLM: {filename}",
                description="Bộ câu hỏi trắc nghiệm tự động tạo từ tài liệu nguồn",
                items=quiz_items
            )
        )

    def _clean_and_parse_json(self, raw_response: str) -> Dict[str, Any]:
        """Làm sạch và bóc tách chuỗi JSON trả về từ VLM."""
        text = raw_response.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        return json.loads(text)

    def _build_learning_package(self, data: Dict[str, Any], filename: str) -> LearningPackage:
        """Chuyển đổi dữ liệu JSON từ VLM thành LearningPackage hoàn chỉnh."""
        pkg_id = f"pkg-{uuid.uuid4().hex[:8]}"
        
        vocab_items: List[VocabularyItem] = []
        for idx, item in enumerate(data.get("items", [])):
            gesture = item.get("stroke_gesture", self.GESTURES[idx % len(self.GESTURES)])
            if gesture not in self.GESTURES:
                gesture = self.GESTURES[idx % len(self.GESTURES)]

            target_t = item.get("target_text", f"Word {idx+1}")
            chars, strokes = self._extract_characters_and_strokes(target_t)

            vocab_items.append(VocabularyItem(
                id=item.get("id", f"v-{idx+1}"),
                target_text=target_t,
                phonetic=item.get("phonetic", ""),
                type_target=item.get("type_target", self._normalize_type_target(target_t)),
                meaning=item.get("meaning", "Nghĩa từ vựng"),
                example=item.get("example"),
                difficulty=item.get("difficulty", 1),
                stroke_gesture=gesture,
                characters=item.get("characters") or chars,
                stroke_count=item.get("stroke_count") or strokes
            ))


        quiz_items: List[QuizItem] = []
        for idx, q in enumerate(data.get("quiz_items", [])):
            options = q.get("options", ["A", "B", "C", "D"])
            while len(options) < 4:
                options.append(f"Phương án {len(options)+1}")
            
            c_idx = q.get("correct_index", 0)
            if not isinstance(c_idx, int) or c_idx < 0 or c_idx >= len(options):
                c_idx = 0

            quiz_items.append(QuizItem(
                id=q.get("id", f"q-{idx+1}"),
                question=q.get("question", "Câu hỏi trắc nghiệm?"),
                options=options[:4],
                correct_index=c_idx,
                explanation=q.get("explanation", "Giải thích đáp án."),
                points=q.get("points", 100)
            ))

        return LearningPackage(
            package_id=pkg_id,
            title=data.get("title", f"Bài học: {filename}"),
            source_filename=filename,
            created_at=datetime.now().isoformat(),
            vocabulary_deck=VocabularyDeck(
                id=f"deck-{pkg_id}",
                title=data.get("title", f"Bộ từ vựng: {filename}"),
                description=data.get("description", "Chuẩn hóa bởi VLM Multimodal AI Engine"),
                target_language=data.get("target_language", "auto"),
                items=vocab_items
            ),
            quiz_deck=QuizDeck(
                id=f"quiz-{pkg_id}",
                title=f"Đấu trường Trắc nghiệm: {data.get('title', filename)}",
                description="Bộ câu hỏi phản xạ chuẩn hóa VLM",
                items=quiz_items
            )
        )

    def _extract_characters_and_strokes(self, target: str) -> Tuple[List[str], int]:
        """Tách các chữ cứng đơn vị và tính số nét (phục vụ ghép chữ trong game ma)"""
        cjk_chars = [c for c in target if '\u4e00' <= c <= '\u9fff']
        if cjk_chars:
            return cjk_chars, len(cjk_chars) * 6
        chars = [c for c in target.strip() if c.isalnum()]
        return chars or [target], len(chars) or 1

    def _normalize_type_target(self, text: str) -> str:

        """Chuyển chuỗi thành định dạng gõ phím sạch (chữ thường, bỏ dấu thanh pinyin/tiếng Việt)."""
        tone_map = {
            'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
            'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
            'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
            'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
            'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
            'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v', 'ü': 'v'
        }
        res = text.lower()
        for k, v in tone_map.items():
            res = res.replace(k, v)
        # Chỉ giữ lại ký tự chữ cái và số
        clean = "".join([c for c in res if c.isalnum()])
        return clean or "word"

    def _clean_meaning(self, text: str) -> str:
        """Làm sạch nghĩa tiếng Việt, bỏ tiền tố thừa như dấu hai chấm, gạch đầu dòng."""
        t = re.sub(r'^[ :\-—=]+', '', text).strip()
        # Loại bỏ các đoạn ví dụ nối tiếp nếu dính
        t = re.split(r'[-—]\s*(?:Ví dụ|Lời|Dùng|Thể hiện|Nhu cầu|Cảm giác)', t)[0].strip()
        return t or text.strip()

    def _approximate_pinyin(self, hanzi: str) -> str:
        """Tạo pinyin giả định cho từ Hán thông dụng nếu không có trong text."""
        dict_map = {
            "你好": "nǐ hǎo",
            "谢谢": "xièxie",
            "不客气": "bú kèqi",
            "对不起": "duìbuqǐ",
            "没关系": "méi guānxi",
            "再见": "zàijiàn",
            "老师": "lǎoshī",
            "朋友": "péngyou",
            "学习": "xuéxí",
            "开心": "kāixīn",
            "喝水": "hē shuǐ",
            "吃饭": "chī fàn",
            "苹果": "píngguǒ",
            "电脑": "diànnǎo",
            "手机": "shǒujī"
        }
        return dict_map.get(hanzi, f"pinyin_{hanzi}")

    def _package_to_summary_text(self, pkg: LearningPackage) -> str:
        """Biến đổi package thành bản tóm tắt văn bản xem trước."""
        lines = [f"=== BỘ TỪ VỰNG CHUẨN HÓA VLM: {pkg.title} ==="]
        for idx, item in enumerate(pkg.vocabulary_deck.items, 1):
            lines.append(f"{idx}. {item.target_text} ({item.phonetic}) : {item.meaning} [Gõ: {item.type_target} | Nét: {item.stroke_gesture}]")
        return "\n".join(lines)
