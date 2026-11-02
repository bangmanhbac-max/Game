import React, { useState } from 'react';
import { X, Shield, Lock, User as UserIcon, Mail, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const HERO_AVATARS = [
  { id: 'iron-man', name: 'Iron Man', icon: '🦾', color: 'from-amber-500 to-red-600', border: 'border-red-500' },
  { id: 'doctor-strange', name: 'Doctor Strange', icon: '🔮', color: 'from-amber-400 to-purple-600', border: 'border-purple-500' },
  { id: 'cap', name: 'Captain America', icon: '🛡️', color: 'from-blue-500 to-red-500', border: 'border-blue-500' },
  { id: 'thor', name: 'Thor Odinson', icon: '⚡', color: 'from-yellow-400 to-sky-500', border: 'border-yellow-400' },
  { id: 'spiderman', name: 'Spider-Man', icon: '🕸️', color: 'from-red-500 to-blue-600', border: 'border-red-400' },
  { id: 'black-widow', name: 'Black Widow', icon: '🕷️', color: 'from-zinc-600 to-red-600', border: 'border-zinc-400' },
  { id: 'hulk', name: 'The Hulk', icon: '🟢', color: 'from-emerald-500 to-green-700', border: 'border-emerald-500' },
  { id: 'scarlet-witch', name: 'Scarlet Witch', icon: '✨', color: 'from-pink-500 to-rose-700', border: 'border-pink-500' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('iron-man');

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setLoginIdentifier('avenger_hero');
    setLoginPassword('password123');
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login({
        username_or_email: loginIdentifier,
        password: loginPassword,
      });
      setSuccessMsg('Đăng nhập thành công! Chào mừng Siêu Anh Hùng.');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập không thành công');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        full_name: regFullName || regUsername,
        avatar: selectedAvatar,
      });
      setSuccessMsg('Gia nhập biệt đội Avengers thành công!');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng ký tài khoản thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async (provider: 'Google' | 'GitHub' | 'Facebook') => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const mockUsername = `${provider.toLowerCase()}_hero_${Math.floor(Math.random() * 899 + 100)}`;
      const mockEmail = `${mockUsername}@avengers.eduplay.ai`;
      try {
        await login({ username_or_email: mockUsername, password: 'oauth_password_123' });
      } catch {
        await register({
          username: mockUsername,
          email: mockEmail,
          password: 'oauth_password_123',
          full_name: `${provider} Warrior`,
          avatar: provider === 'Google' ? 'iron-man' : provider === 'GitHub' ? 'doctor-strange' : 'captain-america',
        });
      }
      setSuccessMsg(`Đăng nhập qua ${provider} thành công! Chào mừng Siêu Anh Hùng.`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || `Lỗi đăng nhập ${provider}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Hologram Card */}
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl bg-gray-800/40 hover:bg-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 mb-3 shadow-lg shadow-cyan-500/20">
            <Shield className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="font-game text-2xl 3xl:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-pink-500 tracking-wider">
            {mode === 'login' ? 'ĐĂNG NHẬP CHIẾN BINH' : 'GIA NHẬP BIỆT ĐỘI AVENGERS'}
          </h2>
          <p className="text-xs 3xl:text-sm text-gray-400 mt-1">
            Lưu trữ tiến trình học tập, bảng xếp hạng Top 4K và bộ từ vựng cá nhân
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#161F30] p-1.5 rounded-2xl border border-gray-800 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              mode === 'login'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              mode === 'register'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Đăng Ký Mới
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="avenger_hero hoặc email..."
                  className="w-full pl-10 pr-4 py-3 bg-[#161F30] border border-gray-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#161F30] border border-gray-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer"
              >
                Điền tài khoản mẫu (Tony Stark)
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang xác thực...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ĐĂNG NHẬP VÀO HỆ THỐNG</span>
                </>
              )}
            </button>

            {/* Social OAuth Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#0F172A] px-2 text-gray-500 font-semibold tracking-wider">
                  Hoặc đăng nhập nhanh bằng
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleOAuthLogin('Google')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#161F30] hover:bg-[#202c42] border border-gray-700 text-xs font-bold text-white transition cursor-pointer"
              >
                <span className="text-red-400 font-black">G</span> Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin('GitHub')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#161F30] hover:bg-[#202c42] border border-gray-700 text-xs font-bold text-white transition cursor-pointer"
              >
                <span className="text-purple-400 font-black">GH</span> GitHub
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin('Facebook')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#161F30] hover:bg-[#202c42] border border-gray-700 text-xs font-bold text-white transition cursor-pointer"
              >
                <span className="text-blue-400 font-black">f</span> Facebook
              </button>
            </div>
          </form>
        )}


        {/* ================= REGISTER FORM ================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="captain_marvel"
                  className="w-full px-3.5 py-2.5 bg-[#161F30] border border-gray-700 focus:border-pink-400 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Carol Danvers"
                  className="w-full px-3.5 py-2.5 bg-[#161F30] border border-gray-700 focus:border-pink-400 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="hero@avengers.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#161F30] border border-gray-700 focus:border-pink-400 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Mật khẩu (tối thiểu 6 ký tự)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#161F30] border border-gray-700 focus:border-pink-400 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Marvel Superhero Avatar Picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Chọn Siêu Anh Hùng Đại Diện
              </label>
              <div className="grid grid-cols-4 gap-2">
                {HERO_AVATARS.map((hero) => (
                  <button
                    key={hero.id}
                    type="button"
                    onClick={() => setSelectedAvatar(hero.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                      selectedAvatar === hero.id
                        ? `bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/20 scale-105`
                        : 'bg-[#161F30] border-gray-800 hover:border-gray-600 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="text-xl">{hero.icon}</span>
                    <span className="text-[10px] font-semibold text-gray-200 truncate w-full text-center">
                      {hero.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <span>Đang khởi tạo tài khoản...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>GIA NHẬP BIỆT ĐỘI NGAY</span>
                </>
              )}
            </button>

            {/* Social OAuth Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#0F172A] px-2 text-gray-500 font-semibold tracking-wider">
                  Hoặc đăng ký nhanh bằng
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleOAuthLogin('Google')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#161F30] hover:bg-[#202c42] border border-gray-700 text-xs font-bold text-white transition cursor-pointer"
              >
                <span className="text-red-400 font-black">G</span> Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin('GitHub')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#161F30] hover:bg-[#202c42] border border-gray-700 text-xs font-bold text-white transition cursor-pointer"
              >
                <span className="text-purple-400 font-black">GH</span> GitHub
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin('Facebook')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#161F30] hover:bg-[#202c42] border border-gray-700 text-xs font-bold text-white transition cursor-pointer"
              >
                <span className="text-blue-400 font-black">f</span> Facebook
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
