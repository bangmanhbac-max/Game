import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Flame, Zap, Compass, RefreshCw } from 'lucide-react';
import { LeaderboardItem } from '../../types/auth';
import { fetchLeaderboard } from '../../lib/api';
import { HERO_AVATARS } from './AuthModal';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async (mode?: string) => {
    setIsLoading(true);
    try {
      const modeParam = mode && mode !== 'all' ? mode : undefined;
      const data = await fetchLeaderboard(modeParam);
      setItems(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData(filterMode);
    }
  }, [isOpen, filterMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/50 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 -mt-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="font-game text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-pink-500">
                BẢNG VINH DANH AVENGERS (4K)
              </h2>
              <p className="text-xs text-gray-400">Top chiến binh có điểm số cao nhất toàn vũ trụ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl bg-gray-800/40 hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 py-4 overflow-x-auto">
          {[
            { id: 'all', label: 'Tất Cả', icon: <Medal className="w-3.5 h-3.5" /> },
            { id: 'chicken-shooter', label: 'Bắn Gà Stark', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
            { id: 'magic-touch', label: 'Doctor Strange', icon: <Compass className="w-3.5 h-3.5 text-pink-400" /> },
            { id: 'quiz-arena', label: 'Speed Quiz', icon: <Zap className="w-3.5 h-3.5 text-emerald-400" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterMode === tab.id
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[#161F30] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}

          <button
            onClick={() => loadData(filterMode)}
            title="Làm mới"
            className="ml-auto p-1.5 text-gray-400 hover:text-white bg-[#161F30] border border-gray-800 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {items.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500 text-xs sm:text-sm">
              Chưa có lượt chơi nào được ghi nhận cho chế độ này. Hãy là người đầu tiên lập kỷ lục!
            </div>
          )}

          {items.map((row) => {
            const hero = HERO_AVATARS.find((h) => h.id === row.avatar) || HERO_AVATARS[0];
            const isTop1 = row.rank === 1;
            const isTop2 = row.rank === 2;
            const isTop3 = row.rank === 3;

            return (
              <div
                key={`${row.username}-${row.played_at}-${row.score}`}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                  isTop1
                    ? 'bg-gradient-to-r from-amber-500/15 via-[#161F30] to-[#161F30] border-amber-400/60 shadow-lg shadow-amber-500/10'
                    : isTop2
                    ? 'bg-gradient-to-r from-slate-400/10 via-[#161F30] to-[#161F30] border-slate-400/50'
                    : isTop3
                    ? 'bg-gradient-to-r from-amber-700/10 via-[#161F30] to-[#161F30] border-amber-700/50'
                    : 'bg-[#161F30]/80 border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center font-black font-game text-sm sm:text-base">
                    {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${row.rank}`}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-lg shadow-md shrink-0">
                    {hero.icon}
                  </div>

                  <div>
                    <p className="font-bold text-white text-xs sm:text-sm">{row.full_name || row.username}</p>
                    <p className="text-[10px] text-gray-400">
                      {hero.name} • {row.game_mode}
                    </p>
                  </div>
                </div>

                {/* Right: Score & Accuracy */}
                <div className="text-right">
                  <span className="font-game font-black text-sm sm:text-base text-amber-300 block">
                    {row.score.toLocaleString()} PTS
                  </span>
                  <span className="text-[10px] text-cyan-400 font-semibold">
                    Độ chính xác: {row.accuracy}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
