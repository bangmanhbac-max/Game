import React from 'react';
import { Volume2, VolumeX, Sparkles, Upload, Gamepad2, Feather, HelpCircle, Key, Trophy, LogIn, FolderOpen, Users, Database, Mail, Ghost, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfileMenu } from './auth/UserProfileMenu';

export type ActiveTab = 'dashboard' | 'upload' | 'chicken-shooter' | 'magic-touch' | 'quiz-arena' | 'granny-forest' | 'flashcard';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenApiKeyModal: () => void;
  onOpenAuthModal: () => void;
  onOpenLeaderboard: () => void;
  onOpenDocuments: () => void;
  onOpenCommunity: () => void;
  onOpenContact: () => void;
  onOpenDbAdmin: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  isDolphinActive: boolean;
  onToggleDolphin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenApiKeyModal,
  onOpenAuthModal,
  onOpenLeaderboard,
  onOpenDocuments,
  onOpenCommunity,
  onOpenContact,
  onOpenDbAdmin,
  isMuted,
  onToggleSound,
  isDolphinActive,
  onToggleDolphin,
}) => {

  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-cyan-950/80 px-2 sm:px-4 lg:px-6 py-2">
      <div className="w-full max-w-[98%] 2xl:max-w-[1950px] 3xl:max-w-[2400px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Logo & Slogan */}
        <div 
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-9 h-9 2xl:w-10 2xl:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-game font-black text-lg 2xl:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">
                EDUPLAY
              </span>
              <span className="text-[9px] 2xl:text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">
                4K ULTRA
              </span>
            </div>
            <p className="text-[10px] 2xl:text-[11px] text-gray-400 -mt-0.5 hidden xl:block">Trò chơi hóa học tập đa chiều</p>
          </div>
        </div>

        {/* Center: Navigation Tabs Group */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#161F30]/80 p-1 rounded-2xl border border-gray-800 shadow-lg shrink-0 overflow-x-auto">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs 2xl:text-sm font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Kho Game</span>
          </button>

          <button
            onClick={() => onSelectTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs 2xl:text-sm font-semibold transition ${
              activeTab === 'upload'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>AI Studio</span>
          </button>

          <div className="h-4 w-px bg-gray-700/80 mx-0.5" />

          {/* Quick Play Tab Icons */}
          <button
            onClick={() => onSelectTab('chicken-shooter')}
            title="Bắn Gà Luyện Gõ Phím 4K"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'chicken-shooter'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🚀</span>
            <span>Bắn Gà</span>
          </button>

          <button
            onClick={() => onSelectTab('magic-touch')}
            title="Vẽ Nét Phép Thuật Doctor Strange"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'magic-touch'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Feather className="w-3.5 h-3.5 text-pink-400" />
            <span>Vẽ Phép</span>
          </button>

          <button
            onClick={() => onSelectTab('quiz-arena')}
            title="Đấu Trường Speed Quiz"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'quiz-arena'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quiz</span>
          </button>

          <button
            onClick={() => onSelectTab('granny-forest')}
            title="Trốn Thoát Rừng Ma Granny 3D (Tìm Chữ Cứng Mở Khóa Cửa)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'granny-forest'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm shadow-red-500/20'
                : 'text-red-400/80 hover:text-red-300 hover:bg-red-950/30'
            }`}
          >
            <Ghost className="w-3.5 h-3.5 text-red-400" />
            <span>Rừng Ma 3D</span>
          </button>

          <button
            onClick={() => onSelectTab('flashcard')}
            title="Thẻ Ghi Nhớ Flashcard 3D Đa Chiều"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'flashcard'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/20'
                : 'text-blue-400/80 hover:text-blue-300 hover:bg-blue-950/30'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Flashcard 3D</span>
          </button>
        </nav>

        {/* Right: Controls, Modals & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Quick Modals Button Group */}
          <div className="flex items-center gap-1 bg-[#161F30]/80 p-1 rounded-xl border border-gray-800">
            {/* Documents Manager */}
            <button
              onClick={onOpenDocuments}
              title="Quản Lý Kho File & Bộ Từ Đã Tải Lên"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/60 text-xs font-semibold transition"
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">Kho File</span>
            </button>

            {/* World Chat & Friends */}
            <button
              onClick={onOpenCommunity}
              title="Kênh Chat Thế Giới & Kết Bạn"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-300 hover:text-purple-400 hover:bg-gray-800/60 text-xs font-semibold transition"
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden xl:inline">Cộng Đồng</span>
            </button>

            {/* Web Database Admin Panel */}
            <button
              onClick={onOpenDbAdmin}
              title="Quản Trị Cơ Sở Dữ Liệu SQLite Qua Web"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 text-xs font-bold transition"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Admin DB</span>
            </button>

            {/* Contact Inquiry */}
            <button
              onClick={onOpenContact}
              title="Trang Liên Hệ & Phản Hồi Hỗ Trợ"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-300 hover:text-pink-400 hover:bg-gray-800/60 text-xs font-semibold transition"
            >
              <Mail className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden xl:inline">Liên Hệ</span>
            </button>
          </div>

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            title="Bảng Vinh Danh Top Điểm Số 4K"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#161F30] border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-bold transition hover:bg-amber-500/10 shadow-md cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">BXH</span>
          </button>

          {/* Compact Utilities Group (Dolphin/Star, Audio, API Key) */}
          <div className="flex items-center gap-1 bg-[#161F30]/80 p-1 rounded-xl border border-gray-800">
            {/* Dolphin & Vietnam Star Toggle */}
            <button
              onClick={onToggleDolphin}
              title={isDolphinActive ? 'Tắt Cá Heo & Chuột Ngôi Sao VN' : 'Bật Cá Heo & Chuột Ngôi Sao VN'}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
                isDolphinActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <span className="text-xs">🐬</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/60 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={onOpenApiKeyModal}
              title="Cấu hình Gemini API Key"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/60 transition"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Auth Profile Pill or Login Button */}
          {isAuthenticated ? (
            <UserProfileMenu onOpenLeaderboard={onOpenLeaderboard} />
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs 2xl:text-sm transition shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-black" />
              <span>Đăng Nhập</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
