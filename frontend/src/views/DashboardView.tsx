import React from 'react';
import { Sparkles, Gamepad2, ArrowRight, BookOpen, Zap, Trophy, Play, Shield, Flame, Compass } from 'lucide-react';
import { LearningPackage } from '../types/learning_content';
import { ActiveTab } from '../components/Navbar';

interface DashboardViewProps {
  decks: LearningPackage[];
  activeDeck: LearningPackage;
  onSelectDeck: (deck: LearningPackage) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  decks,
  activeDeck,
  onSelectDeck,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-10 py-2 w-full mx-auto">
      {/* 4K Cinematic Avengers Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 group min-h-[460px] 2xl:min-h-[520px] 3xl:min-h-[580px] flex items-center">
        {/* 4K Avengers Wallpaper Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url('/assets/avengers_4k.jpg')" }}
        />

        {/* Cinematic Multi-Layer Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070A12] via-[#0B0F19]/85 to-[#070A12]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] via-transparent to-[#070A12]/40" />

        {/* Glowing Arc Reactor Ambient Flares */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl p-8 lg:p-14 3xl:p-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs 3xl:text-sm font-black mb-5 shadow-lg shadow-cyan-500/20 backdrop-blur-md">
            <Shield className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>AVENGERS 4K ULTRA-HD EDITION • NỀN TẢNG HỌC TẬP THẾ HỆ MỚI</span>
          </div>

          <h1 className="font-game text-3xl sm:text-4xl lg:text-5xl 3xl:text-6xl font-black text-white leading-tight tracking-wide drop-shadow-md">
            BIẾN MỌI TÀI LIỆU THÀNH <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-red-500">
              TRẬN CHIẾN SIÊU ANH HÙNG
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base 3xl:text-lg text-gray-200 leading-relaxed max-w-2xl drop-shadow">
            Nạp file <span className="text-cyan-300 font-bold">PDF, DOCX, Ảnh chụp</span> hoặc dán nội dung. 
            AI sẽ tức tốc phân tích và biến tài liệu thành 3 đấu trường đồ họa 4K chân thực: 
            <span className="text-amber-300 font-bold"> Iron Man Space Shooter</span>, 
            <span className="text-pink-300 font-bold"> Doctor Strange Magic Touch</span>, và 
            <span className="text-emerald-300 font-bold"> Stark Tech Speed Quiz</span>!
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigateTab('upload')}
              className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black px-7 py-4 rounded-2xl text-sm 3xl:text-base transition shadow-xl shadow-cyan-500/30 cursor-pointer hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-black" />
              <span>Nạp File Tạo Game Với AI</span>
            </button>

            <button
              onClick={() => onNavigateTab('chicken-shooter')}
              className="flex items-center gap-2 bg-[#0B0F19]/80 hover:bg-[#161F30] text-white font-bold px-7 py-4 rounded-2xl text-sm 3xl:text-base border border-cyan-500/40 hover:border-cyan-400 transition shadow-lg backdrop-blur-md"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>Tham Chiến Ngay (4K)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Game Modes Showcase with 4K Posters */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-game text-xl 3xl:text-2xl font-bold text-white tracking-wider flex items-center gap-2.5">
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
              CÁC ĐẤU TRƯỜNG GAMING ĐỒ HỌA CAO (4K)
            </h2>
            <p className="text-xs 3xl:text-sm text-gray-400 mt-1">Nâng tầm trải nghiệm học từ vựng với visual bom tấn Hollywood</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 3xl:gap-6">
          {/* Game 1: Chicken Shooter (Iron Man Space Invaders) */}
          <div
            onClick={() => onNavigateTab('chicken-shooter')}
            className="group relative overflow-hidden bg-[#161F30] border border-amber-500/30 hover:border-amber-400 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl hover:shadow-amber-500/20 flex flex-col justify-between"
          >
            {/* Card 4K Poster Thumbnail */}
            <div className="relative h-40 3xl:h-48 w-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: "url('/assets/iron_man_4k.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161F30] via-[#161F30]/40 to-transparent" />
              <div className="absolute top-3 left-3 bg-amber-500/20 border border-amber-400/50 backdrop-blur-md px-2.5 py-0.5 rounded-xl text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>STARK REAPERS</span>
              </div>
            </div>

            <div className="p-5 3xl:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-game text-base 3xl:text-lg font-bold text-amber-300 mb-2">
                  BẮN GÀ LUYỆN GÕ PHÍM
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Chiến đấu cơ Stark Nano-Armor đánh chặn đàn Drone mang từ vựng. Gõ đúng ký tự để khai hỏa tia Plasma!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-amber-400">
                <span>Vào Buồng Lái</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>

          {/* Game 2: Magic Touch (Doctor Strange Sanctum) */}
          <div
            onClick={() => onNavigateTab('magic-touch')}
            className="group relative overflow-hidden bg-[#161F30] border border-pink-500/30 hover:border-pink-400 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl hover:shadow-pink-500/20 flex flex-col justify-between"
          >
            {/* Card 4K Poster Thumbnail */}
            <div className="relative h-40 3xl:h-48 w-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: "url('/assets/doctor_strange_4k.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161F30] via-[#161F30]/40 to-transparent" />
              <div className="absolute top-3 left-3 bg-pink-500/20 border border-pink-400/50 backdrop-blur-md px-2.5 py-0.5 rounded-xl text-[11px] font-bold text-pink-300 flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-pink-300" />
                <span>MYSTIC SANCTUM</span>
              </div>
            </div>

            <div className="p-5 3xl:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-game text-base 3xl:text-lg font-bold text-pink-300 mb-2">
                  MAGIC TOUCH (VẼ PHÉP)
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Vẽ tự do nét phép thuật (—, |, /, \, V, ^, O, ⚡) với hiệu ứng tia lửa Eldritch để phá nổ bóng bay ma thuật!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-pink-400">
                <span>Thi Triển Phép</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>

          {/* Game 3: Speed Quiz Arena (Avengers Endgame Battle) */}
          <div
            onClick={() => onNavigateTab('quiz-arena')}
            className="group relative overflow-hidden bg-[#161F30] border border-emerald-500/30 hover:border-emerald-400 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl hover:shadow-emerald-500/20 flex flex-col justify-between"
          >
            {/* Card 4K Poster Thumbnail */}
            <div className="relative h-40 3xl:h-48 w-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: "url('/assets/avengers_battle_4k.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161F30] via-[#161F30]/40 to-transparent" />
              <div className="absolute top-3 left-3 bg-emerald-500/20 border border-emerald-400/50 backdrop-blur-md px-2.5 py-0.5 rounded-xl text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                <Trophy className="w-3 h-3 text-emerald-300" />
                <span>AVENGERS ARENA</span>
              </div>
            </div>

            <div className="p-5 3xl:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-game text-base 3xl:text-lg font-bold text-emerald-300 mb-2">
                  SPEED QUIZ ARENA
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Đấu trường trắc nghiệm phản xạ nhanh Stark Tech. Đánh giá độ thông hiểu và tích lũy Combo liên hoàn!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-emerald-400">
                <span>Vào Đấu Trường</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>

          {/* Game 4: Granny Escape 3D (3-Tier Dark Forest) */}
          <div
            onClick={() => onNavigateTab('granny-forest')}
            className="group relative overflow-hidden bg-[#161F30] border border-red-500/40 hover:border-red-400 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl hover:shadow-red-500/30 flex flex-col justify-between"
          >
            {/* Card Thumbnail */}
            <div className="relative h-40 3xl:h-48 w-full overflow-hidden bg-gradient-to-br from-red-950/80 via-black to-[#0d131f]">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl filter drop-shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse">🌲</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#161F30] via-transparent to-transparent" />
              <div className="absolute top-3 left-3 bg-red-500/30 border border-red-400/60 backdrop-blur-md px-2.5 py-0.5 rounded-xl text-[11px] font-bold text-red-300 flex items-center gap-1.5">
                <span>👻</span>
                <span>GRANNY 3D ESCAPE</span>
              </div>
            </div>

            <div className="p-5 3xl:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-game text-base 3xl:text-lg font-bold text-red-400 mb-2">
                  TRỐN THOÁT RỪNG MA 3D
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Đồ họa 3D 3 tầng rừng rậm. Bật đèn pin, né tránh ma quỷ Granny rình rập và nhặt cổ tự chữ Hán để mở khóa cổng!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-red-400">
                <span>Vào Rừng Ma</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>

          {/* Game 5: Flashcard 3D Arena */}
          <div
            onClick={() => onNavigateTab('flashcard')}
            className="group relative overflow-hidden bg-[#161F30] border border-blue-500/40 hover:border-blue-400 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl hover:shadow-blue-500/30 flex flex-col justify-between"
          >
            {/* Card Thumbnail */}
            <div className="relative h-40 3xl:h-48 w-full overflow-hidden bg-gradient-to-br from-blue-950/80 via-slate-900 to-[#0d131f]">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl filter drop-shadow-[0_0_15px_rgba(59,130,246,0.7)] group-hover:rotate-12 transition-transform duration-500">🎴</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#161F30] via-transparent to-transparent" />
              <div className="absolute top-3 left-3 bg-blue-500/30 border border-blue-400/60 backdrop-blur-md px-2.5 py-0.5 rounded-xl text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                <span>⚡</span>
                <span>SPATIAL MEMORY</span>
              </div>
            </div>

            <div className="p-5 3xl:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-game text-base 3xl:text-lg font-bold text-blue-400 mb-2">
                  FLASHCARD 3D ĐA CHIỀU
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Thẻ 3D lật 360°, bóc tách từng nét bút chữ cứng, phát âm audio chuẩn và lặp lại ngắt quãng Spaced Repetition!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-blue-400">
                <span>Mở Flashcard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Learning Deck Card */}
      <div className="bg-[#161F30]/90 border border-gray-800 rounded-3xl p-6 lg:p-8 3xl:p-10 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Gói Bài Học Đang Chọn
                </span>
                <span className="text-xs text-gray-500">{activeDeck.vocabulary_deck.items.length} từ vựng • {activeDeck.quiz_deck.items.length} câu quiz</span>
              </div>
              <h3 className="text-xl 3xl:text-2xl font-bold text-white mt-1.5">{activeDeck.title}</h3>
              <p className="text-xs 3xl:text-sm text-gray-400 mt-0.5">{activeDeck.vocabulary_deck.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {decks.length > 1 && (
              <select
                value={activeDeck.package_id}
                onChange={(e) => {
                  const found = decks.find((d) => d.package_id === e.target.value);
                  if (found) onSelectDeck(found);
                }}
                className="bg-[#0B0F19] text-xs 3xl:text-sm text-cyan-300 font-semibold px-3 py-2.5 rounded-xl border border-gray-700 hover:border-cyan-500/40 focus:outline-none"
              >
                {decks.map((d) => (
                  <option key={d.package_id} value={d.package_id}>
                    {d.title}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => onNavigateTab('upload')}
              className="px-4 py-2.5 rounded-xl border border-gray-700 hover:border-gray-500 text-xs 3xl:text-sm font-semibold text-gray-300 hover:text-white transition"
            >
              Chỉnh Sửa Bộ Từ
            </button>
            <button
              onClick={() => onNavigateTab('chicken-shooter')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs 3xl:text-sm font-bold transition shadow-lg shadow-cyan-500/20"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Chơi Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
