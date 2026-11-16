import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Compass, 
  BookOpen, 
  Gamepad2, 
  Cpu, 
  Trophy
} from 'lucide-react';
import { ActiveTab } from '../Navbar';

export interface TourStep {
  targetId: string;
  title: string;
  subtitle?: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
  tabRequirement?: ActiveTab;
  preferredPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  padding?: number;
}

export const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-hero-banner',
    title: 'Chào Mừng Đến Với EduPlay 4K',
    subtitle: 'Nền tảng Học Tập Trò Chơi Hóa Thế Hệ Mới',
    description: 'Ứng dụng Trí tuệ Nhân tạo Đa phương thức (VLM AI) và Đồ họa 3D Avengers 4K. Giúp bạn tiếp thu từ vựng tiếng Anh & tiếng Trung nhanh gấp 3 lần qua trải nghiệm gaming đỉnh cao!',
    badge: 'TỔNG QUAN',
    icon: <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />,
    preferredPosition: 'bottom',
    padding: 12
  },
  {
    targetId: 'tour-deck-selector',
    title: 'Gói Bài Học & Bộ Từ Vựng',
    subtitle: 'Quản lý Giáo trình Linh hoạt',
    description: 'Dễ dàng lựa chọn hơn 20 bộ bài học mẫu có sẵn (HSK 1-3, Tiếng Anh AI, IT, Kinh Doanh, Du Lịch, Y Tế...). Bạn có thể bấm "+ Thêm Bộ Từ" hoặc "Xóa Bộ Từ" để tùy biến kho dữ liệu học tập!',
    badge: 'GIÁO TRÌNH',
    icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
    preferredPosition: 'top',
    padding: 14
  },
  {
    targetId: 'tour-games-grid',
    title: 'Kho 5 Đấu Trường Game Đồ Họa 3D',
    subtitle: '5 Chế độ Gaming Tương Tác Chuyên Sâu',
    description: 'Lựa chọn đấu trường yêu thích: Stark Reapers (Bắn gà luyện gõ phím), Mystic Sanctum (Vẽ cử chỉ phép thuật Doctor Strange), Speed Quiz Arena (Phản xạ trắc nghiệm), Rừng Ma Granny 3D (Sinh tồn giải đố chữ Hán) và Flashcard 3D Đa Chiều!',
    badge: 'ĐẤU TRƯỜNG',
    icon: <Gamepad2 className="w-5 h-5 text-pink-400" />,
    preferredPosition: 'top',
    padding: 16
  },
  {
    targetId: 'tour-nav-upload',
    title: 'AI Studio - Phân Tích VLM Tài Liệu',
    subtitle: 'Biến Sách Học Thô Thành Đề Game',
    description: 'Chỉ cần kéo thả file PDF, DOCX, Ảnh chụp sách hoặc bấm nút 1 chạm "Test File Dính Chữ", "Tiếng Trung HSK", "Tiếng Anh AI" để mô hình thị giác AI tự động phân tích và tạo bài học ngay lập tức!',
    badge: 'VLM STUDIO',
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
    preferredPosition: 'bottom',
    padding: 10
  },
  {
    targetId: 'tour-leaderboard',
    title: 'Bảng Vinh Danh Top Điểm Số',
    subtitle: 'Đua Top BXH & Tích Lũy Điểm',
    description: 'Mỗi ván game chiến thắng sẽ tích lũy điểm thưởng và tỷ lệ chính xác. Hãy so tài cùng bạn bè và ghi tên mình trên đỉnh Bảng Vinh Danh toàn cầu!',
    badge: 'VINH DANH',
    icon: <Trophy className="w-5 h-5 text-amber-400" />,
    preferredPosition: 'bottom',
    padding: 8
  },
  {
    targetId: 'tour-guide-btn',
    title: 'Xem Lại Hướng Dẫn Bất Cứ Lúc Nào',
    subtitle: 'Hệ Thống Ánh Sáng Hội Tụ Spotlight',
    description: 'Nếu muốn khám phá lại các tính năng hoặc hướng dẫn bạn bè, bạn luôn có thể nhấn nút "Hướng Dẫn" này trên thanh điều hướng để khởi động lại chuỗi giới thiệu trực quan!',
    badge: 'HƯỚNG DẪN',
    icon: <Compass className="w-5 h-5 text-emerald-400" />,
    preferredPosition: 'bottom',
    padding: 8
  }
];

interface SpotlightTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const SpotlightTour: React.FC<SpotlightTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const step = TOUR_STEPS[currentStepIndex];

  // Play subtle UI click sound
  const playTourSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  };

  // Find and measure target element
  const updateTargetRect = useCallback(() => {
    if (!isOpen || !step) return;

    const el = document.getElementById(step.targetId);
    if (el) {
      // Scroll into view smoothly if not visible
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const rect = el.getBoundingClientRect();
      setTargetRect({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    } else {
      // If target element is not on current tab, auto switch to dashboard
      if (step.tabRequirement && onNavigateTab) {
        onNavigateTab(step.tabRequirement);
      } else if (onNavigateTab) {
        onNavigateTab('dashboard');
      }
      // Retry in 300ms after tab switch
      setTimeout(() => {
        const retryEl = document.getElementById(step.targetId);
        if (retryEl) {
          retryEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const rect = retryEl.getBoundingClientRect();
          setTargetRect({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          });
        }
      }, 350);
    }
  }, [isOpen, step, onNavigateTab]);

  useEffect(() => {
    if (isOpen) {
      updateTargetRect();
      playTourSound();
    }
  }, [isOpen, currentStepIndex, updateTargetRect]);

  // Handle window resize and scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isOpen, step]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      localStorage.setItem('eduplay_tour_completed', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const pad = step?.padding || 14;
  const spotX = targetRect ? Math.max(0, targetRect.x - pad) : 0;
  const spotY = targetRect ? Math.max(0, targetRect.y - pad) : 0;
  const spotW = targetRect ? targetRect.width + pad * 2 : 0;
  const spotH = targetRect ? targetRect.height + pad * 2 : 0;

  // Compute Card Tooltip Position
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  let tooltipTop = spotY + spotH + 20;
  let tooltipLeft = Math.max(20, Math.min(windowWidth - 440, spotX + (spotW / 2) - 210));

  // If tooltip goes off-screen at bottom, flip to above the target
  if (tooltipTop + 240 > windowHeight && spotY > 260) {
    tooltipTop = Math.max(20, spotY - 250);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto">
      {/* SVG Mask Cutout with Converging Radial Darkness */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            {/* White covers entire screen */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cuts out the spotlight hole */}
            {targetRect && (
              <rect
                x={spotX}
                y={spotY}
                width={spotW}
                height={spotH}
                rx="24"
                ry="24"
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Cinematic Darkened Screen Overlay */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(4, 7, 14, 0.82)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Target Focus Ring & Sci-Fi Converging Light Accents */}
      {targetRect && (
        <div
          className="absolute pointer-events-none rounded-3xl border-2 border-cyan-400 transition-all duration-400 ease-out"
          style={{
            left: `${spotX}px`,
            top: `${spotY}px`,
            width: `${spotW}px`,
            height: `${spotH}px`,
            boxShadow: '0 0 35px rgba(6, 182, 212, 0.75), inset 0 0 15px rgba(6, 182, 212, 0.35)'
          }}
        >
          {/* Animated Expanding Ripple Ping */}
          <div className="absolute -inset-2 rounded-3xl border border-cyan-300 animate-ping opacity-40 pointer-events-none" />

          {/* 4 Corner Targeting HUD Brackets (Truy Kích / GTA 5 Style) */}
          <div className="absolute -top-2.5 -left-2.5 w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl-sm pointer-events-none" />
          <div className="absolute -top-2.5 -right-2.5 w-5 h-5 border-t-2 border-r-2 border-amber-400 rounded-tr-sm pointer-events-none" />
          <div className="absolute -bottom-2.5 -left-2.5 w-5 h-5 border-b-2 border-l-2 border-amber-400 rounded-bl-sm pointer-events-none" />
          <div className="absolute -bottom-2.5 -right-2.5 w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br-sm pointer-events-none" />

          {/* Converging Center Light Beacon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-400/20 blur-md animate-pulse pointer-events-none" />
        </div>
      )}

      {/* Interactive Floating Tooltip Dialog Card */}
      <div
        className="absolute z-55 w-[92vw] max-w-[420px] transition-all duration-300 ease-out animate-in fade-in zoom-in-95"
        style={{
          top: `${tooltipTop}px`,
          left: `${tooltipLeft}px`,
        }}
      >
        <div className="relative bg-[#0d131f]/98 border border-cyan-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl text-white">
          
          {/* Top Header: Badge, Step Counter & Close */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-black text-cyan-300 tracking-wider">
                {step.badge}
              </span>
              <span className="text-xs font-mono font-bold text-gray-400">
                Bước {currentStepIndex + 1}/{TOUR_STEPS.length}
              </span>
            </div>

            <button
              onClick={() => {
                localStorage.setItem('eduplay_tour_completed', 'true');
                onClose();
              }}
              title="Đóng hướng dẫn"
              className="p-1 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="py-4 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 font-game">
                  {step.title}
                </h3>
                {step.subtitle && (
                  <p className="text-xs text-cyan-400 font-semibold">{step.subtitle}</p>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-1">
              {step.description}
            </p>
          </div>

          {/* Progress Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 py-2">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-7 bg-cyan-400 shadow-md shadow-cyan-400/50'
                    : idx < currentStepIndex
                    ? 'w-2 bg-emerald-400/70'
                    : 'w-2 bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-800/80">
            <button
              onClick={() => {
                localStorage.setItem('eduplay_tour_completed', 'true');
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-200 transition cursor-pointer"
            >
              Bỏ qua
            </button>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-xl bg-[#161F30] hover:bg-gray-800 border border-gray-700 text-xs font-bold text-gray-200 flex items-center gap-1 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Trước</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/30 transition transform hover:scale-105 cursor-pointer"
              >
                <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Khám phá ngay! 🎉' : 'Tiếp theo'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
