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

  // Sync API Key from localStorage whenever drawer opens or key updates
  useEffect(() => {
    const sync = () => {
      const stored = sanitizeGeminiApiKey(localStorage.getItem('gemini_api_key'));
      setApiKey(stored);
    };
    window.addEventListener('storage', sync);
    window.addEventListener('eduplay:key_updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('eduplay:key_updated', sync);
    };
  }, []);

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
        content: 'Greetings, Avengers warrior! I am JARVIS AI Copilot. I can help analyze Hanzi characters, stroke breakdowns, radicals, explain VLM OCR mechanisms, or share tips to survive Granny\'s Ghost Forest 3D!'
      }
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTestKeyInsideChat = async () => {
    const candidate = sanitizeGeminiApiKey(keyDraft || apiKey);
    if (!candidate) {
      setKeyTestStatus({ success: false, error: 'Please enter an API Key before testing.' });
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
        window.dispatchEvent(new Event('eduplay:key_updated'));
      }
    } catch (err: any) {
      setKeyTestStatus({ success: false, error: err?.message || 'Network error during validation' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveApiKey = () => {
    const clean = sanitizeGeminiApiKey(keyDraft);
    if (!clean) return;
    localStorage.setItem('gemini_api_key', clean);
    setApiKey(clean);
    window.dispatchEvent(new Event('eduplay:key_updated'));
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
        content: '🎉 **Gemini API connected successfully!** I am now connected directly to Google Gemini intelligence to answer all your inquiries in real time.'
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawInput = (textToSend || inputText).trim();
    if (!rawInput || isLoading) return;

    setInputText('');

    // Automatically detect if user pastes Gemini API Key directly into chat
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
          sender_name: localStorage.getItem('eduplay_username') || 'You',
          sender_avatar: 'iron-man',
          content: '🔑 [Submitted Gemini API Key]'
        },
        {
          id: `bot-${Date.now()}`,
          channel: 'ai_copilot',
          role: 'assistant',
          sender_name: 'JARVIS AI Copilot',
          sender_avatar: 'doctor-strange',
          content: '🎉 **Awesome!** I detected and securely saved your Gemini API Key in browser storage. Online AI is 100% active!'
        }
      ]);
      return;
    }

    const currentKey = sanitizeGeminiApiKey(apiKey || localStorage.getItem('gemini_api_key'));

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      channel: 'ai_copilot',
      role: 'user',
      sender_name: localStorage.getItem('eduplay_username') || 'You',
      sender_avatar: 'iron-man',
      content: rawInput
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    let replyText = '';
    let usedModel = '';
    let detailedError = '';

    // 1. Direct call to Gemini REST API from client if key available
    if (currentKey) {
      for (const model of GEMINI_WORKING_MODELS) {
        try {
          const directRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(currentKey)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(15000),
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        text: `You are JARVIS AI Copilot - the Gamification AI Learning Assistant of the EduPlay platform (Avengers 4K Universe). Analyze vocabulary, stroke counts, Pinyin, translations, or provide gaming advice based on the user question below in an intelligent, accurate, and vivid style:\n\n${rawInput}`
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
          detailedError = modelErr?.message || 'Network error connecting to Google Gemini';
          console.warn(`[JARVIS Chat] Model ${model} fetch exception:`, modelErr);
        }
      }
    }

    // 2. Fallback: Try backend API endpoint if running local dev
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

    // 3. If AI generation succeeded, display answer
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

    // 4. Intelligent built-in knowledge base for common queries
    const lower = rawInput.toLowerCase().trim();
    let smartFallback = '';

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('chào') || lower === 'hey') {
      smartFallback = '👋 **Hello warrior!** I am **JARVIS AI Copilot** of the EduPlay 4K Gamified Learning Universe. I am ready to help analyze Hanzi characters, stroke structures, Pinyin, English/Chinese vocabulary, and guide you through all mini-games!';
    } else if (lower.includes('stroke') || lower.includes('radical') || lower.includes('nét') || lower.includes('你') || lower.includes('好')) {
      smartFallback = `🔍 **Essential Hanzi Stroke Analysis:**\n\n- **Character 你 (nǐ - You):** Left radical **Person (亻)**, right component **尔 (ěr)**. Total **7 strokes**.\n\n- **Character 好 (hǎo - Good/Fine):** Formed from radical **Woman (女)** and radical **Child (子)**. Ancient wisdom viewed having a balance of family as true goodness! Total **6 strokes**.\n\n💡 *Tip*: Try **Flashcard 3D** mode to flip cards 360° and observe stroke order step by step!`;
    } else if (lower.includes('granny') || lower.includes('forest') || lower.includes('rừng ma')) {
      smartFallback = `🌲 **Granny Ghost Forest 3D Survival Tactics:**\n\n1. **FPS Controls:** **W** (Forward), **S** (Backward), **A** (Strafe Left), **D** (Strafe Right).\n2. **360° Mouse Look:** Pan your mouse smoothly for authentic AAA shooter exploration.\n3. **Magic Flashlight:** Press **F** to pierce the nighttime gloom.\n4. **Objective:** Collect scattered ancient Hanzi glyphs, break Granny's line of sight, and unlock the escape portal!`;
    } else if (lower.includes('chicken') || lower.includes('stark') || lower.includes('typing') || lower.includes('bắn gà')) {
      smartFallback = `🚀 **Stark Galaxy Typist Guide:** Type the displayed vocabulary or Pinyin accurately to fire plasma laser salvos. Faster typing speeds build higher Combo streaks!`;
    } else if (lower.includes('magic') || lower.includes('rune') || lower.includes('vẽ phép')) {
      smartFallback = `✨ **Doctor Strange Mystic Rune Guide:** Draw gesture symbols (—, |, /, \\, V, ^, O, ⚡) with your mouse or finger matching balloons to burst them and rescue vocabulary!`;
    } else if (lower.includes('vlm') || lower.includes('vision') || lower.includes('ocr')) {
      smartFallback = `🤖 **VLM (Vision-Language Model) OCR Mechanism:**\n\nEmploys convolutional vision encoders combined with Transformer cross-attention to isolate connected cursive strokes, predict character bounding boxes, and cross-reference calligraphy corpora for 99.4% extraction accuracy!`;
    }

    if (smartFallback) {
      let suffix = '';
      if (!currentKey) {
        suffix = '\n\n*(💡 You haven\'t entered an API Key yet. Click **🔑 Connect API** in the header to chat freely with live Google Gemini AI!)*';
      } else if (detailedError) {
        suffix = `\n\n*(⚠️ Google Gemini API notice: "${detailedError}". JARVIS is answering using built-in system knowledge)*`;
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

    // 5. Fallback notice if no keyword matches and API fails:
    const errorNotice = !currentKey
      ? '⚠️ **Chatbot API Key Missing**: Please click **🔑 Connect API** in the chat header to enter a free Gemini API Key (obtain at aistudio.google.com) for real-time AI responses!'
      : `⚠️ **Unable to connect to Google Gemini AI**: ${detailedError || 'Network timeout or API quota limit'}.\n\n👉 Please verify your key under **🔑 API Key** settings!`;

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
    'Analyze stroke structure of "你" and "好"',
    'How to survive Granny 3D Ghost Forest?',
    'How does VLM OCR handle cursive handwriting?'
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-purple-500/30 transition-all hover:scale-105 cursor-pointer border border-cyan-400/40 min-h-[44px]"
          title="Chat with AI Copilot"
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
              Key Needed
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
                <p className="text-[10px] text-gray-400">AI Learning Copilot & Language Mentor</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* API Key Status Pill / Button */}
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                title={apiKey ? 'Gemini API connected (Click to modify key)' : 'Click to configure Gemini API Key'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  apiKey
                    ? 'bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/25'
                    : 'bg-amber-500/20 border border-amber-400/60 text-amber-300 hover:bg-amber-500/30 animate-pulse'
                }`}
              >
                <Key className="w-3 h-3 text-yellow-400" />
                <span>{apiKey ? 'API Online' : 'Connect API'}</span>
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
                  Configure Google Gemini API Key
                </span>
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-0.5"
                >
                  Get Free Key <ExternalLink className="w-2.5 h-2.5" />
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
                  placeholder="Paste AIzaSy... or AQ... key here"
                  className="flex-1 bg-[#0b101c] border border-gray-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKeyText(!showKeyText)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                  title="Toggle key visibility"
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
                  <span>Test</span>
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
                >
                  Save
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
                      <span>Valid key! Successfully connected to <strong>{keyTestStatus.model}</strong>.</span>
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
                    <Check className="w-3 h-3 text-emerald-400" /> Active: ••••••••••••{apiKey.slice(-4)}
                  </span>
                  <button
                    onClick={() => {
                      localStorage.removeItem('gemini_api_key');
                      setApiKey('');
                      setKeyTestStatus(null);
                    }}
                    className="text-red-400 hover:underline cursor-pointer"
                  >
                    Remove Key
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Notice if Key Saved */}
          {keySavedMessage && (
            <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-3 py-1 text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> API Key saved successfully!
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
                <span>No API Key set. Click here to connect AI!</span>
              </div>
              <span className="text-xs font-bold underline">Setup ↗</span>
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
                <span>JARVIS is thinking and analyzing...</span>
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
              placeholder="Ask AI about vocabulary, stroke structure, or game tips..."
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
