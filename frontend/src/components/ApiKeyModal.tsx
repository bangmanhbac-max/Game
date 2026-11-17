import React, { useState, useEffect } from 'react';
import { Key, Check, X, ShieldAlert, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { testGeminiApiKey, sanitizeGeminiApiKey } from '../lib/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; model?: string; error?: string } | null>(null);

  useEffect(() => {
    const existing = sanitizeGeminiApiKey(localStorage.getItem('gemini_api_key'));
    setApiKey(existing);
    setTestResult(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const cleanKey = sanitizeGeminiApiKey(apiKey);
    if (!cleanKey) {
      setTestResult({ success: false, error: 'Vui lòng nhập mã API Key trước khi kiểm tra.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGeminiApiKey(cleanKey);
      setTestResult(res);
      if (res.success) {
        localStorage.setItem('gemini_api_key', cleanKey);
      }
    } catch (e: any) {
      setTestResult({ success: false, error: e?.message || 'Lỗi mạng không xác định' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const cleanKey = sanitizeGeminiApiKey(apiKey);
    if (cleanKey) {
      localStorage.setItem('gemini_api_key', cleanKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    window.dispatchEvent(new Event('eduplay:key_updated'));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setTestResult(null);
    window.dispatchEvent(new Event('eduplay:key_updated'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#161F30] border border-cyan-500/40 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl shadow-cyan-950/80">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 border border-cyan-400/40 rounded-2xl text-cyan-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-game tracking-wider">Cấu Hình Gemini API</h3>
              <p className="text-xs text-gray-400">Kết nối trực tiếp Google AI Studio & Gemini Models</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="mt-5 space-y-4">
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Nhập <span className="text-cyan-400 font-bold">Google Gemini API Key</span> của bạn để phân tích sách, tài liệu học tập, sinh câu hỏi và tương tác AI trực tiếp từ trình duyệt mà không bị giới hạn.
          </p>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase tracking-wider text-gray-300 font-bold">
                Mã API Key (AIzaSy... hoặc AQ...)
              </label>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showKey ? 'Ẩn mã' : 'Hiện mã'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="Dán mã API Key (ví dụ: AQ.Ab8... hoặc AIzaSy...)"
                className="w-full bg-[#0B0F19] border border-gray-700 focus:border-cyan-400 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition font-mono pr-28"
              />

              <button
                type="button"
                disabled={isTesting || !apiKey.trim()}
                onClick={handleTestKey}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang thử...</span>
                  </>
                ) : (
                  <span>Kiểm Tra</span>
                )}
              </button>
            </div>
          </div>

          {/* Test Result Alert Banner */}
          {testResult && (
            <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed animate-in fade-in ${
              testResult.success 
                ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200'
                : 'bg-red-500/15 border-red-400/50 text-red-200'
            }`}>
              <div className="flex items-start gap-2.5">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm mb-0.5">
                    {testResult.success ? 'Kết Nối Thành Công!' : 'Kết Nối Thất Bại'}
                  </div>
                  <div>
                    {testResult.success ? (
                      <span>Đã xác thực thành công với Google Gemini! Mô hình khả dụng: <strong className="text-white font-mono">{testResult.model}</strong>. Bạn có thể sử dụng AI để tạo bài học ngay bây giờ!</span>
                    ) : (
                      <span>{testResult.error}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guidance Info Box */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200 leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-bold">Lưu ý:</span> Khóa API của bạn được lưu an toàn cục bộ trong trình duyệt của bạn (LocalStorage) và gửi trực tiếp tới máy chủ Google khi tạo bài học, hoàn toàn bảo mật.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
          {apiKey ? (
            <button
              onClick={handleClear}
              className="px-3.5 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
            >
              Xóa Key Này
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-200 transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-cyan-500/20 cursor-pointer transform hover:scale-105"
            >
              {saved ? <Check className="w-4 h-4" /> : null}
              <span>{saved ? 'Đã Lưu Thành Công!' : 'Lưu Cấu Hình'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
