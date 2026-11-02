import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';
import { submitContactForm } from '../../lib/api';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Ý kiến đóng góp EduPlay AI',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await submitContactForm(formData);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: 'Ý kiến đóng góp EduPlay AI', message: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi gửi tin nhắn';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0e1626] border-2 border-cyan-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 bg-[#141f33] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Liên Hệ & Đóng Góp Ý Kiến</h3>
              <p className="text-xs text-gray-400">Đội ngũ Avengers AI EduPlay luôn lắng nghe phản hồi của bạn</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
              <h4 className="text-xl font-bold text-white">Gửi Ý Kiến Thành Công!</h4>
              <p className="text-sm text-gray-300">
                Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được thông tin và sẽ phản hồi qua email trong thời gian sớm nhất!
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs transition"
              >
                Gửi thêm liên hệ khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Họ và Tên</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-[#161F30] border border-gray-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-white focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Email Phản Hồi</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your-email@example.com"
                    className="w-full bg-[#161F30] border border-gray-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Chủ Đề</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Góp ý tính năng / Báo lỗi / Hợp tác..."
                  className="w-full bg-[#161F30] border border-gray-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Nội Dung</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Mô tả chi tiết ý kiến hoặc góp ý của bạn..."
                  className="w-full bg-[#161F30] border border-gray-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-white focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi ý kiến...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi Tin Nhắn Liên Hệ</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Info */}
          <div className="pt-4 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-2 bg-[#131b2c] p-3 rounded-xl border border-gray-800">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>support@eduplay.ai</span>
            </div>
            <div className="flex items-center gap-2 bg-[#131b2c] p-3 rounded-xl border border-gray-800">
              <Phone className="w-4 h-4 text-purple-400" />
              <span>1900 8888 (24/7)</span>
            </div>
            <div className="flex items-center gap-2 bg-[#131b2c] p-3 rounded-xl border border-gray-800">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Avengers Tower, VN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
