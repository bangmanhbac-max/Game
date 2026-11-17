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
  Trophy,
  Target
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
    title: 'Welcome to EduPlay 4K',
    subtitle: 'Next-Gen Gamified AI Learning Universe',
    description: 'Powered by Multimodal Vision AI (VLM) and 4K Avengers 3D graphics. Accelerate your language acquisition 3x faster through an immersive gaming experience!',
    badge: 'OVERVIEW',
    icon: <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />,
    preferredPosition: 'bottom',
    padding: 12
  },
  {
    targetId: 'tour-deck-selector',
    title: 'Learning Decks & Curriculum',
    subtitle: 'Dynamic Course Management',
    description: 'Easily select from 20+ curated master decks (HSK 1-3, AI Tech, Business, Travel, Medical...). Click "+ Add Deck" or "Delete Deck" to customize your personal study vault!',
    badge: 'CURRICULUM',
    icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
    preferredPosition: 'top',
    padding: 14
  },
  {
    targetId: 'tour-games-grid',
    title: '5 High-Fidelity 3D Game Arenas',
    subtitle: '5 Immersive Interactive Modes',
    description: 'Choose your battle arena: Stark Galaxy Typist (keyboard space combat), Doctor Strange Mystic Rune (gesture spellcasting), Speed Quiz Arena (fast-reflex trivia), Scarlet Ghost Forest 3D (first-person Hanzi survival), and 3D Multi-Dimensional Flashcards!',
    badge: 'ARENAS',
    icon: <Gamepad2 className="w-5 h-5 text-pink-400" />,
    preferredPosition: 'top',
    padding: 16
  },
  {
    targetId: 'tour-nav-upload',
    title: 'AI Studio - VLM Document Engine',
    subtitle: 'Transform Raw Books Into Game Decks',
    description: 'Simply drag and drop PDF, DOCX, textbook scans, or click 1-touch demo buttons ("OCR Dense Document", "HSK Mandarin", "AI Tech English") for instant neural extraction!',
    badge: 'VLM STUDIO',
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
    preferredPosition: 'bottom',
    padding: 10
  },
  {
    targetId: 'tour-leaderboard',
    title: 'Global Hall of Fame',
    subtitle: 'Competitive Leaderboards & XP',
    description: 'Every victory yields battle points, combo multipliers, and accuracy stats. Compete with players worldwide and claim your place atop the Global Leaderboard!',
    badge: 'LEADERBOARD',
    icon: <Trophy className="w-5 h-5 text-amber-400" />,
    preferredPosition: 'bottom',
    padding: 8
  },
  {
    targetId: 'tour-guide-btn',
    title: 'Interactive Guided Tour',
    subtitle: 'Converging Spotlight Focus System',
    description: 'Whenever you want to review features or guide new players, click "Tour" in the top navigation bar to relaunch this visual walkthrough!',
    badge: 'GUIDE',
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

  // Always reset to step 0 when reopened
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  const step = TOUR_STEPS[currentStepIndex];

  // Play subtle game-style audio chime
  const playTourSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(940, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {}
  };

  // Find and measure target element with mobile fallback
  const updateTargetRect = useCallback(() => {
    if (!isOpen || !step) return;

    let targetId = step.targetId;
    let el = document.getElementById(targetId);

    // Fallback if desktop nav upload button is hidden on small screens
    if ((!el || el.offsetParent === null) && targetId === 'tour-nav-upload') {
      el = document.getElementById('tour-hero-btn-upload');
    }

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const rect = el.getBoundingClientRect();
      setTargetRect({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    } else {
      if (step.tabRequirement && onNavigateTab) {
        onNavigateTab(step.tabRequirement);
      } else if (onNavigateTab) {
        onNavigateTab('dashboard');
      }
      setTimeout(() => {
        let retryEl = document.getElementById(step.targetId);
        if ((!retryEl || retryEl.offsetParent === null) && step.targetId === 'tour-nav-upload') {
          retryEl = document.getElementById('tour-hero-btn-upload');
        }
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
      let targetId = step.targetId;
      let el = document.getElementById(targetId);
      if ((!el || el.offsetParent === null) && targetId === 'tour-nav-upload') {
        el = document.getElementById('tour-hero-btn-upload');
      }
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
  const centerX = spotX + spotW / 2;
  const centerY = spotY + spotH / 2;
  const borderRadius = Math.min(28, Math.max(16, spotH / 3));

  // Compute Card Tooltip Position
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  let tooltipTop = spotY + spotH + 24;
  let tooltipLeft = Math.max(16, Math.min(windowWidth - 436, centerX - 210));

  // If tooltip goes off-screen at bottom, flip to above the target
  if (tooltipTop + 260 > windowHeight && spotY > 260) {
    tooltipTop = Math.max(16, spotY - 260);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto">
      
      {/* 1. SVG Cutout Mask: Cinematic Darkened Screen with Rounded Spotlight Hole */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            {/* White covers entire viewport */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cuts out the rounded spotlight window */}
            {targetRect && (
              <rect
                x={spotX}
                y={spotY}
                width={spotW}
                height={spotH}
                rx={borderRadius}
                ry={borderRadius}
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Ambient Darkened Backdrop with SVG Mask */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(5, 8, 15, 0.84)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* 2. Converging Volumetric Light Cone: Radial Gradient Beaming Into the Target */}
      {targetRect && (
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
          style={{
            background: `radial-gradient(ellipse at ${centerX}px ${centerY}px, rgba(6, 182, 212, 0.22) 0%, rgba(6, 182, 212, 0.06) ${Math.max(spotW, spotH) * 0.8}px, transparent ${Math.max(spotW, spotH) * 1.5}px)`
          }}
        />
      )}

      {/* 3. Glowing Converging Focus Rings & Sci-Fi HUD Reticle */}
      {targetRect && (
        <div
          className="absolute pointer-events-none transition-all duration-400 ease-out"
          style={{
            left: `${spotX}px`,
            top: `${spotY}px`,
            width: `${spotW}px`,
            height: `${spotH}px`,
            borderRadius: `${borderRadius}px`,
            border: '2px solid rgba(6, 182, 212, 0.85)',
            boxShadow: '0 0 35px rgba(6, 182, 212, 0.75), 0 0 70px rgba(6, 182, 212, 0.25), inset 0 0 20px rgba(6, 182, 212, 0.35)'
          }}
        >
          {/* Animated Inward Converging Pulse Rings */}
          <div 
            className="absolute -inset-3 rounded-[32px] border border-cyan-400/40 animate-pulse pointer-events-none" 
            style={{ borderRadius: `${borderRadius + 8}px` }}
          />
          <div 
            className="absolute -inset-6 rounded-[36px] border border-cyan-400/25 animate-ping opacity-30 pointer-events-none duration-1000" 
            style={{ borderRadius: `${borderRadius + 14}px` }}
          />

          {/* 4 Corner Targeting HUD Brackets (Truy Kích / GTA 5 Style) */}
          <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-sm pointer-events-none drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-sm pointer-events-none drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400 rounded-bl-sm pointer-events-none drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400 rounded-br-sm pointer-events-none drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />

          {/* Converging Target Reticle Badge */}
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#070A12]/95 border border-cyan-400 text-cyan-300 text-[10px] font-mono font-black uppercase tracking-wider shadow-lg shadow-cyan-500/40 flex items-center gap-1.5 whitespace-nowrap animate-bounce pointer-events-none">
            <Target className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>TARGET: {step.badge}</span>
          </div>
        </div>
      )}

      {/* 4. Interactive Floating Tooltip Dialog Card */}
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
                Step {currentStepIndex + 1} of {TOUR_STEPS.length}
              </span>
            </div>

            <button
              onClick={() => {
                localStorage.setItem('eduplay_tour_completed', 'true');
                onClose();
              }}
              title="Close Tour"
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
              Skip
            </button>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-xl bg-[#161F30] hover:bg-gray-800 border border-gray-700 text-xs font-bold text-gray-200 flex items-center gap-1 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/30 transition transform hover:scale-105 cursor-pointer"
              >
                <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Start Exploring! 🎉' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
