import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Loader2,
  Key,
  Check,
  ExternalLink
} from 'lucide-react';
import { fetchChatMessages, sendChatMessage, ChatMessage } from '../../lib/api';

export const AICopilotChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [keySavedMessage, setKeySavedMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync API Key from localStorage whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('gemini_api_key') || '';
      setApiKey(stored);
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      const msgs = await fetchChatMessages('ai_copilot');
      if (msgs.length === 0) {
        // Welcome message
        setMessages([
          {
            id: 'welcome',
            channel: 'ai_copilot',
            role: 'assistant',
            sender_name: 'JARVIS AI Copilot',
            sender_avatar: 'doctor-strange',
            content: 'Xin chào chiến binh Avengers! Tôi là JARVIS AI Copilot. Tôi có thể giúp bạn giải nghĩa chữ Hán, phân tích số nét, cấu tạo bộ thủ, giải thích cơ chế VLM hoặc hướng dẫn vượt qua rừng ma Granny!'
          }
        ]);
      } else {
        setMessages(msgs);
      }
    } catch {
      // Fallback local message
      setMessages([
        {
          id: 'welcome',
          channel: 'ai_copilot',
          role: 'assistant',
          sender_name: 'JARVIS AI Copilot',
          sender_avatar: 'doctor-strange',
          content: 'Xin chào! Tôi là Trợ lý AI Giáo dục EduPlay. Hãy hỏi tôi bất cứ điều gì về từ vựng hay các mini-game nhé!'
        }
      ]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveApiKey = () => {
    const trimmed = keyDraft.trim();
    if (!trimmed) return;
    localStorage.setItem('gemini_api_key', trimmed);
    setApiKey(trimmed);
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
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');

    // Tự động nhận diện nếu người dùng dán Gemini API Key trực tiếp vào khung chat
    if (text.startsWith('AIzaSy') && text.length > 30) {
      localStorage.setItem('gemini_api_key', text);
      setApiKey(text);
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

    const currentKey = apiKey || localStorage.getItem('gemini_api_key') || undefined;

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      channel: 'ai_copilot',
      role: 'user',
      sender_name: localStorage.getItem('eduplay_username') || 'Bạn',
      sender_avatar: 'iron-man',
      content: text
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      // 1. Thử gửi qua backend API endpoint
      const res = await sendChatMessage(text, 'ai_copilot', tempUserMsg.sender_name, 'iron-man', currentKey);
      if (res && res.ai_reply) {
        setMessages((prev) => [...prev, res.ai_reply!]);
        return;
      }
      throw new Error('Chưa nhận được phản hồi từ backend');
    } catch {
      // 2. Dự phòng: Nếu backend có sự cố hoặc offline, gọi trực tiếp Gemini REST API từ client
      if (currentKey) {
        try {
          const directRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${currentKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        text: `Bạn là JARVIS AI Copilot - Trợ lý AI Giáo dục Gamification của hệ thống AI EduPlay (Avengers 4K). Hãy phân tích kỹ chữ Hán, số nét, Pinyin, nghĩa từ vựng hoặc hướng dẫn game theo câu hỏi sau:\n\n${text}`
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
              setMessages((prev) => [
                ...prev,
                {
                  id: `direct-${Date.now()}`,
                  channel: 'ai_copilot',
                  role: 'assistant',
                  sender_name: 'JARVIS AI Copilot (Direct)',
                  sender_avatar: 'doctor-strange',
                  content: reply.trim()
                }
              ]);
              return;
            }
          }
        } catch (clientErr) {
          console.error('[AICopilot] Direct call failed:', clientErr);
        }
      }

      // Thông báo hướng dẫn nếu chưa kết nối API
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          channel: 'ai_copilot',
          role: 'assistant',
          sender_name: 'JARVIS AI Copilot',
          sender_avatar: 'doctor-strange',
          content: currentKey
            ? '⚠️ Kết nối đến máy chủ AI đang gặp gián đoạn tạm thời. Bạn hãy thử lại sau ít giây nhé!'
            : '⚠️ **Chatbot chưa kết nối API Key**: Bạn vui lòng bấm vào nút **🔑 Cấu hình API** ở thanh trên của hộp chat để nhập Gemini API Key miễn phí (lấy tại aistudio.google.com), AI sẽ hoạt động thông minh tức thì!'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
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
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-2xl shadow-purple-500/30 transition-all hover:scale-105 cursor-pointer border border-cyan-400/40"
          title="Trò chuyện với AI Copilot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-yellow-300" />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${apiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${apiKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
          <span>JARVIS AI Copilot</span>
          {!apiKey && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/50 px-1.5 py-0.5 rounded-full">
              Cần Key
            </span>
          )}
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[580px] max-h-[88vh] bg-[#0d1527] border-2 border-cyan-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-5">
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
                  type="password"
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  placeholder="Dán mã AIzaSy... vào đây"
                  className="flex-1 bg-[#0b101c] border border-gray-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Lưu
                </button>
              </div>
              {apiKey && (
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> Đang dùng: ••••••••••••{apiKey.slice(-4)}
                  </span>
                  <button
                    onClick={() => {
                      localStorage.removeItem('gemini_api_key');
                      setApiKey('');
                    }}
                    className="text-red-400 hover:underline"
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
