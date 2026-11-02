import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Trophy, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HERO_AVATARS } from './AuthModal';

interface UserProfileMenuProps {
  onOpenLeaderboard: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ onOpenLeaderboard }) => {
  const { user, logout, updateProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsChangingAvatar(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const currentHero = HERO_AVATARS.find((h) => h.id === user.avatar) || HERO_AVATARS[0];

  const handleSelectAvatar = async (avatarId: string) => {
    await updateProfile({ avatar: avatarId });
    setIsChangingAvatar(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161F30] border border-cyan-500/40 hover:border-cyan-400 text-white transition shadow-md shadow-cyan-950/40 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-sm shadow-sm">
          {currentHero.icon}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold leading-tight text-cyan-300">
            {user.full_name || user.username}
          </p>
          <span className="text-[10px] text-gray-400 block -mt-0.5">
            {currentHero.name}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#0F172A] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-black/80 p-4 z-50 animate-fade-in text-xs space-y-3">
          {/* User Info Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-xl shadow-md">
              {currentHero.icon}
            </div>
            <div className="truncate">
              <p className="font-bold text-white text-sm truncate">{user.full_name || user.username}</p>
              <p className="text-gray-400 text-[11px] truncate">{user.email}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1">
            <button
              onClick={() => { setIsChangingAvatar(!isChangingAvatar); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Đổi Siêu Anh Hùng Đại Diện</span>
            </button>

            <button
              onClick={() => { setIsOpen(false); onOpenLeaderboard(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Bảng Xếp Hạng Top 4K</span>
            </button>
          </div>

          {/* Avatar Switcher Submenu */}
          {isChangingAvatar && (
            <div className="pt-2 border-t border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 mb-2">CHỌN AVATAR MỚI:</p>
              <div className="grid grid-cols-4 gap-1.5">
                {HERO_AVATARS.map((hero) => (
                  <button
                    key={hero.id}
                    onClick={() => handleSelectAvatar(hero.id)}
                    className={`p-1.5 rounded-lg border flex flex-col items-center gap-0.5 transition ${
                      user.avatar === hero.id
                        ? 'border-cyan-400 bg-cyan-500/20'
                        : 'border-gray-800 hover:border-gray-600 bg-[#161F30]'
                    }`}
                  >
                    <span className="text-base">{hero.icon}</span>
                    <span className="text-[8px] text-gray-300 truncate w-full text-center">{hero.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="pt-2 border-t border-gray-800">
            <button
              onClick={() => { setIsOpen(false); logout(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
