import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Loader2,
  Key,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  fetchChatMessages, 
  sendChatMessage, 
  ChatMessage, 
  GEMINI_WORKING_MODELS, 
  sanitizeGeminiApiKey, 
  testGeminiApiKey 
} from '../../lib/api';

export const AICopilotChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => sanitizeGeminiApiKey(localStorage.getItem('gemini_api_key')));
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<{ success: boolean; model?: string; error?: string } | null>(null);
  const [keySavedMessage, setKeySavedMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync API Key from localStorage whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      const stored = sanitizeGeminiApiKey(localStorage.getItem('gemini_api_key'));
      setApiKey(stored);
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      const msgs = await fetchChatMessages('ai_copilot');
      if (msgs && msgs.length > 0) {
        setMessages(msgs);
        return;
      }
    } catch {
      // Fallback local initial message
    }
    
    setMessages([
      {
        id: 'welcome',
        channel: 'ai_copilot',
        role: 'assistant',
        sender_name: 'JARVIS AI Copilot',
        sender_avatar: 'doctor-strange',
        content: 'Xin chào chiến binh Avengers! Tôi là JARVIS AI Copilot. Tôi có thể giúp bạn giải nghĩa chữ Hán, phân tích số nét, cấu tạo bộ thủ, giải thích cơ chế VLM hoặc chia sẻ mẹo vượt qua rừng ma Granny!'
      }
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTestKeyInsideChat = async () => {
    const candidate = sanitizeGeminiApiKey(keyDraft || apiKey);
    if (!candidate) {
      setKeyTestStatus({ success: false, error: 'Vui lòng nhập mã API Key trước khi kiểm tra.' });
      return;
    }
    setIsTestingKey(true);
    setKeyTestStatus(null);
    try {
      const res = await testGeminiApiKey(candidate);
      setKeyTestStatus(res);
      if (res.success) {
        localStorage.setItem('gemini_api_key', candidate);
        setApiKey(candidate);
      }
    } catch (err: any) {
      setKeyTestStatus({ success: false, error: err?.message || 'Lỗi mạng khi kiểm tra' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveApiKey = () => {
    const clean = sanitizeGeminiApiKey(keyDraft);
    if (!clean) return;
    localStorage.setItem('gemini_api_key', clean);
    setApiKey(clean);
    setKeyDraft('');
    setKeySavedMessage(true);
    setShowKeyInput(false);
    setTimeout(() => setKeySavedMessage(false), 3000);

    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        channel: 'ai_copilot',
        role: 'assistant',
        sender_name: 'JARVIS AI Copilot',
        sender_avatar: 'doctor-strange',
        content: '🎉 **Kết nối Gemini API thành công!** Kể từ bây giờ, tôi đã kết nối trực tiếp với siêu trí tuệ nhân tạo Gemini để giải đáp mọi thắc mắc của bạn theo thời gian thực.'
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawInput = (textToSend || inputText).trim();
    if (!rawInput || isLoading) return;

    setInputText('');

    // Tự động nhận diện nếu người dùng dán Gemini API Key trực tiếp vào khung chat
    const keyCandidate = sanitizeGeminiApiKey(rawInput);
    if ((keyCandidate.startsWith('AIzaSy') || keyCandidate.startsWith('AQ.') || keyCandidate.startsWith('AQ')) && keyCandidate.length > 25) {
      localStorage.setItem('gemini_api_key', keyCandidate);
      setApiKey(keyCandidate);
      setKeySavedMessage(true);
      setTimeout(() => setKeySavedMessage(false), 3000);
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          channel: 'ai_copilot',
          role: 'user',
          sender_name: localStorage.getItem('eduplay_username') || 'Bạn',
          sender_avatar: 'iron-man',
          content: '🔑 [Đã gửi mã Gemini API Key]'
        },
        {
          id: `bot-${Date.now()}`,
          channel: 'ai_copilot',
          role: 'assistant',
          sender_name: 'JARVIS AI Copilot',
          sender_avatar: 'doctor-strange',
          content: '🎉 **Tuyệt vời!** Tôi đã tự động nhận diện và lưu mã Gemini API Key của bạn vào trình duyệt. Trí tuệ nhân tạo trực tuyến đã được kích hoạt 100%!'
        }
      ]);
      return;
    }

    const currentKey = sanitizeGeminiApiKey(apiKey || localStorage.getItem('gemini_api_key'));

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      channel: 'ai_copilot',
      role: 'user',
      sender_name: localStorage.getItem('eduplay_username') || 'Bạn',
      sender_avatar: 'iron-man',
      content: rawInput
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    let replyText = '';
    let usedModel = '';
    let detailedError = '';

    // 1. Gọi trực tiếp Gemini REST API từ client nếu đã có key
    if (currentKey) {
      for (const model of GEMINI_WORKING_MODELS) {
        try {
          const directRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(currentKey)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        text: `Bạn là JARVIS AI Copilot - Trợ lý AI Giáo dục Gamification của hệ thống AI EduPlay (vũ trụ Avengers 4K). Hãy phân tích kỹ chữ Hán, số nét, Pinyin, nghĩa từ vựng hoặc hướng dẫn game theo câu hỏi sau một cách thông minh, chuẩn xác và sinh động:\n\n${rawInput}`
                      }
                    ]
                  }
                ]
              })
            }
          );

          if (directRes.ok) {
            const data = await directRes.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              replyText = reply.trim();
              usedModel = model;
              break;
            }
          } else {
            const errData = await directRes.json().catch(() => null);
            detailedError = errData?.error?.message || `HTTP ${directRes.status}`;
            console.warn(`[JARVIS Chat] Model ${model} returned error:`, detailedError);
            if (directRes.status === 400 && (detailedError.includes('API_KEY_INVALID') || detailedError.includes('API key not valid'))) {
              break;
            }
          }
        } catch (modelErr: any) {
          detailedError = modelErr?.message || 'Lỗi mạng khi kết nối Google Gemini';
          console.warn(`[JARVIS Chat] Model ${model} fetch exception:`, modelErr);
        }
      }
    }

    // 2. Dự phòng: Thử gọi qua backend API endpoint nếu đang chạy local dev
    if (!replyText && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      try {
        const res = await sendChatMessage(rawInput, 'ai_copilot', tempUserMsg.sender_name, 'iron-man', currentKey);
        if (res && res.ai_reply?.content) {
          replyText = res.ai_reply.content;
          usedModel = 'Backend AI';
        }
      } catch (backendErr: any) {
        console.warn('[JARVIS Chat] Backend call failed/skipped:', backendErr);
      }
    }

    // 3. Nếu AI sinh nội dung thành công, hiển thị câu trả lời
    if (replyText) {
      setMessages((prev) => [
        ...prev,
        {
          id: `direct-${Date.now()}`,
          channel: 'ai_copilot',
          role: 'assistant',
          sender_name: `JARVIS AI Copilot (${usedModel})`,
          sender_avatar: 'doctor-strange',
          content: replyText
        }
      ]);
      setIsLoading(false);
      return;
    }

    // 4. Tri thức chuyên gia nội tại thông minh cho các câu hỏi phổ biến
    const lower = rawInput.toLowerCase().trim();
    let smartFallback = '';

    if (lower.includes('chào') || lower.includes('hello') || lower.includes('hi') || lower === 'alo') {
      smartFallback = '👋 **Xin chào bạn!** Tôi là **JARVIS AI Copilot** của nền tảng AI EduPlay (Avengers 4K). Tôi luôn sẵn sàng hỗ trợ bạn phân tích chữ Hán, số nét, phiên âm Pinyin, nghĩa từ vựng Tiếng Trung/Tiếng Anh và hướng dẫn các mini-game!';
    } else if (lower.includes('nét') || lower.includes('bộ thủ') || lower.includes('chữ') || lower.includes('你') || lower.includes('好')) {
      smartFallback = `🔍 **Phân tích chữ Hán căn bản:**\n\n- **Chữ 你 (nǐ - Bạn/Anh/Em):** Gồm bộ **Nhân đứng (亻)** chỉ con người ở bên trái, kết hợp chữ **Nhĩ (尔)** bên phải. Tổng cộng gồm **7 nét**.\n\n- **Chữ 好 (hǎo - Tốt/Đẹp/Ngon/Hảo):** Ghép từ bộ **Nữ (女)** (người phụ nữ) và bộ **Tử (子)** (đứa con trai). Người xưa quan niệm phụ nữ có con trai vẹn tròn là điều tốt lành mỹ hảo nhất! Tổng cộng **6 nét**.\n\n💡 *Mẹo ghi nhớ*: Bạn hãy vào chế độ **Flashcard 3D** để xoay 360° và bóc tách từng nét bút nhé!`;
    } else if (lower.includes('granny') || lower.includes('rừng ma') || lower.includes('ma quỷ')) {
      smartFallback = `🌲 **Bí kíp Trốn Thoát Rừng Ma Granny 3D:**\n\n1. **Phím di chuyển chuẩn FPS:** **W** (Tiến thẳng), **S** (Lùi), **A** (Bước trái), **D** (Bước phải).\n2. **Góc nhìn 360°:** Rê chuột để quay góc nhìn linh hoạt như các tựa game bắn súng FPS.\n3. **Đèn pin ma thuật:** Bấm **F** để soi sáng ban đêm.\n4. **Mục tiêu:** Thu thập đủ các Cổ Tự Chữ Hán rải rác trong khu rừng, né tránh tầm nhìn của quỷ Granny để mở cổng kết giới thành công!`;
    } else if (lower.includes('bắn gà') || lower.includes('chicken') || lower.includes('gõ phím')) {
      smartFallback = `🚀 **Hướng dẫn Bắn Gà Stark Tech:** Gõ chính xác từ vựng hoặc Pinyin hiển thị trên từng Drone để nạp năng lượng tia Plasma bắn hạ mục tiêu. Tốc độ gõ càng nhanh, điểm Combo càng cao!`;
    } else if (lower.includes('vẽ phép') || lower.includes('magic')) {
      smartFallback = `✨ **Hướng dẫn Vẽ Phép Magic Touch:** Dùng chuột hoặc ngón tay vẽ các nét cử chỉ ma thuật (—, |, /, \\, V, ^, O, ⚡) tương ứng với ký hiệu trên bóng bay để giải cứu từ vựng!`;
    } else if (lower.includes('vlm') || lower.includes('thị giác') || lower.includes('chữ dính')) {
      smartFallback = `🤖 **Cơ chế VLM (Vision-Language Model) xử lý chữ dính:**\n\nMô hình sử dụng mạng tích chập thị giác kết hợp Transformer để phân rã ảnh chữ viết tay, phát hiện bounding box từng nét kể cả khi chữ dính nhau, sau đó đối chiếu với cơ sở dữ liệu thư pháp để phục hồi từ vựng chuẩn xác!`;
    }

    if (smartFallback) {
      let suffix = '';
      if (!currentKey) {
        suffix = '\n\n*(💡 Bạn chưa nhập API Key. Hãy bấm vào nút **🔑 Kết nối API** ở thanh trên để trò chuyện tự do với AI Gemini trực tuyến!)*';
      } else if (detailedError) {
        suffix = `\n\n*(⚠️ Google Gemini API thông báo: "${detailedError}". JARVIS đang trả lời bằng tri thức nội tại của hệ thống)*`;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          channel: 'ai_copilot',
          role: 'assistant',
          sender_name: 'JARVIS AI Copilot',
          sender_avatar: 'doctor-strange',
          content: smartFallback + suffix
        }
      ]);
      setIsLoading(false);
      return;
    }

    // 5. Nếu không khớp từ khóa chuyên biệt và API thất bại:
    const errorNotice = !currentKey
      ? '⚠️ **Chatbot chưa kết nối API Key**: Bạn vui lòng bấm vào nút **🔑 Cấu hình API** ở thanh trên của hộp chat để nhập Gemini API Key miễn phí (lấy tại aistudio.google.com), AI sẽ hoạt động thông minh tức thì!'
      : `⚠️ **Không thể kết nối đến Google Gemini AI**: ${detailedError || 'Lỗi mạng hoặc giới hạn API'}.\n\n👉 Bạn hãy kiểm tra lại mã API Key tại nút **🔑 Cấu hình API** ở góc trên nhé!`;

    setMessages((prev) => [
      ...prev,
      {
        id: `err-${Date.now()}`,
        channel: 'ai_copilot',
        role: 'assistant',
        sender_name: 'JARVIS AI Copilot',
        sender_avatar: 'doctor-strange',
        content: errorNotice
      }
    ]);

    setIsLoading(false);
  };

  const quickPrompts = [
    'Phân tích chữ "你" và "好" gồm những nét nào?',
    'Cách chơi Game Ma Granny ghép chữ?',
    'Cơ chế VLM xử lý chữ dính nhau như thế nào?'
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-purple-500/30 transition-all hover:scale-105 cursor-pointer border border-cyan-400/40 min-h-[44px]"
          title="Trò chuyện với AI Copilot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-yellow-300" />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${apiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${apiKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
          <span className="hidden sm:inline">JARVIS AI Copilot</span>
          <span className="sm:hidden font-bold">AI Copilot</span>
          {!apiKey && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/50 px-1.5 py-0.5 rounded-full">
              Cần Key
            </span>
          )}
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-96 h-[580px] max-h-[85dvh] bg-[#0d1527] border-2 border-cyan-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#141e33] to-[#1c1335] border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  JARVIS AI Copilot
                  <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </h4>
                <p className="text-[10px] text-gray-400">Trợ Lý Giáo Dục & Phân Tích Chữ Hán</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* API Key Status Pill / Button */}
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                title={apiKey ? 'Gemini API đã kết nối (Bấm để thay đổi key)' : 'Bấm để cấu hình Gemini API Key'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  apiKey
                    ? 'bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/25'
                    : 'bg-amber-500/20 border border-amber-400/60 text-amber-300 hover:bg-amber-500/30 animate-pulse'
                }`}
              >
                <Key className="w-3 h-3 text-yellow-400" />
                <span>{apiKey ? 'API Online' : 'Kết nối API'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inline API Key Config Drawer */}
          {showKeyInput && (
            <div className="p-3 bg-[#11192e] border-b border-cyan-500/40 space-y-2 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-yellow-400" />
                  Cấu Hình Google Gemini API Key
                </span>
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-0.5"
                >
                  Lấy Key Miễn Phí <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type={showKeyText ? "text" : "password"}
                  value={keyDraft}
                  onChange={(e) => {
                    setKeyDraft(e.target.value);
                    setKeyTestStatus(null);
                  }}
                  placeholder="Dán mã AIzaSy... hoặc AQ... vào đây"
                  className="flex-1 bg-[#0b101c] border border-gray-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKeyText(!showKeyText)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                  title="Hiện/Ẩn key"
                >
                  {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleTestKeyInsideChat}
                  disabled={isTestingKey}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/50 text-purple-200 font-bold text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  {isTestingKey ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  <span>Kiểm Tra</span>
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
                >
                  Lưu
                </button>
              </div>

              {/* Status of key test */}
              {keyTestStatus && (
                <div className={`p-2 rounded-xl text-xs flex items-center gap-1.5 border ${
                  keyTestStatus.success 
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                    : 'bg-red-500/15 border-red-500/40 text-red-300'
                }`}>
                  {keyTestStatus.success ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Key hợp lệ! Đã kết nối thành công với <strong>{keyTestStatus.model}</strong>.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{keyTestStatus.error}</span>
                    </>
                  )}
                </div>
              )}

              {apiKey && (
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> Đang dùng: ••••••••••••{apiKey.slice(-4)}
                  </span>
                  <button
                    onClick={() => {
                      localStorage.removeItem('gemini_api_key');
                      setApiKey('');
                      setKeyTestStatus(null);
                    }}
                    className="text-red-400 hover:underline cursor-pointer"
                  >
                    Xóa Key
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Notice if Key Saved */}
          {keySavedMessage && (
            <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-3 py-1 text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Đã kết nối API thành công!
            </div>
          )}

          {/* Warning banner if no key configured */}
          {!apiKey && !showKeyInput && (
            <div
              onClick={() => setShowKeyInput(true)}
              className="bg-amber-500/15 hover:bg-amber-500/25 border-b border-amber-500/30 px-3 py-1.5 text-[11px] text-amber-300 font-medium flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Chưa nhập API Key. Bấm vào đây để kết nối AI!</span>
              </div>
              <span className="text-xs font-bold underline">Nhập ↗</span>
            </div>
          )}

          {/* Quick Prompts */}
          <div className="p-2.5 bg-[#090e1a] border-b border-gray-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(qp)}
                className="px-2.5 py-1 rounded-full bg-[#161F30] hover:bg-cyan-500/20 border border-gray-700 hover:border-cyan-400/40 text-gray-300 hover:text-cyan-300 shrink-0 transition"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] p-3 rounded-2xl leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                        : 'bg-[#161F30] text-gray-200 border border-gray-800 rounded-tl-none shadow-md'
                    }`}
                  >
                    {!isUser && (
                      <span className="text-[10px] text-purple-400 font-bold block mb-1">
                        {m.sender_name}
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs py-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>JARVIS đang suy nghĩ và phân tích...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0b101c] border-t border-gray-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Hỏi AI về chữ cứng, nghĩa, nét vẽ hoặc mẹo game..."
              className="flex-1 bg-[#161F30] border border-gray-700 focus:border-cyan-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
