import React, { useEffect, useRef, useState } from 'react';
import { CloudRain, Zap, Sun, Moon, Sparkles, Orbit } from 'lucide-react';

export type WeatherEffect = 'none' | 'cosmic-storm' | 'cyber-rain' | 'quantum-realm';
export type ThemeMode = 'dark' | 'light' | 'avengers-4k';

interface AtmosphereControllerProps {
  onWeatherChange?: (effect: WeatherEffect) => void;
  onThemeChange?: (theme: ThemeMode) => void;
}

export const AtmosphereController: React.FC<AtmosphereControllerProps> = ({
  onWeatherChange,
  onThemeChange,
}) => {
  const [weather, setWeather] = useState<WeatherEffect>('cosmic-storm');
  const [theme, setTheme] = useState<ThemeMode>('avengers-4k');
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    onWeatherChange?.(weather);
  }, [weather, onWeatherChange]);

  useEffect(() => {
    onThemeChange?.(theme);
  }, [theme, onThemeChange]);

  // Real-time canvas animation for dynamic atmospheric effects (Rain, Storm, Cosmic Energy)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles setup
    interface Particle {
      x: number;
      y: number;
      speedY: number;
      speedX: number;
      length: number;
      size: number;
      color: string;
      alpha: number;
    }

    const particles: Particle[] = [];
    const count = weather === 'cyber-rain' ? 120 : weather === 'cosmic-storm' ? 80 : weather === 'quantum-realm' ? 60 : 0;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: weather === 'cyber-rain' ? 8 + Math.random() * 8 : 1 + Math.random() * 3,
        speedX: weather === 'cosmic-storm' ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 1,
        length: weather === 'cyber-rain' ? 15 + Math.random() * 15 : 2,
        size: Math.random() * 2.5 + 1,
        color: weather === 'cyber-rain' ? '#00e5ff' : weather === 'cosmic-storm' ? '#a855f7' : '#eab308',
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    let lightningTimer = 0;
    let lightningAlpha = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Sấm chớp bão vũ trụ
      if (weather === 'cosmic-storm') {
        lightningTimer++;
        if (lightningTimer > 180 && Math.random() < 0.05) {
          lightningAlpha = 0.25;
          lightningTimer = 0;
        }
        if (lightningAlpha > 0) {
          ctx.fillStyle = `rgba(168, 85, 247, ${lightningAlpha})`;
          ctx.fillRect(0, 0, width, height);
          lightningAlpha -= 0.015;
        }
      }

      // Render Particles
      for (const p of particles) {
        ctx.beginPath();
        if (weather === 'cyber-rain') {
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.lineWidth = 1.2;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
          ctx.stroke();
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
      }

      ctx.globalAlpha = 1.0;
      animationId = requestAnimationFrame(render);
    };

    if (count > 0) {
      render();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [weather]);

  return (
    <>
      {/* Background Weather Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{ display: weather === 'none' ? 'none' : 'block' }}
      />

      {/* Control Pill in top bar */}
      <div className="relative z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161F30]/80 hover:bg-[#1f2b42] border border-cyan-500/40 text-xs font-semibold text-cyan-300 transition shadow-lg backdrop-blur-md cursor-pointer"
          title="Tùy chỉnh Cảnh 4K, Sáng/Tối & Bão Vũ Trụ"
        >
          {weather === 'cosmic-storm' && <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />}
          {weather === 'cyber-rain' && <CloudRain className="w-3.5 h-3.5 text-cyan-400" />}
          {weather === 'quantum-realm' && <Orbit className="w-3.5 h-3.5 text-amber-400" />}
          {weather === 'none' && <Sun className="w-3.5 h-3.5 text-yellow-400" />}
          <span>Cảnh 4K & Hiệu Ứng</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-[#0d1527] border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Cảnh Khí Quyển 4K
            </h4>

            {/* Weather selector */}
            <div className="space-y-1 mb-3">
              <button
                onClick={() => setWeather('cosmic-storm')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  weather === 'cosmic-storm'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-purple-400" /> Bão Vũ Trụ (Cosmic Storm)
                </span>
                {weather === 'cosmic-storm' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
              </button>

              <button
                onClick={() => setWeather('cyber-rain')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  weather === 'cyber-rain'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Mưa Cyber (Cyber Rain)
                </span>
                {weather === 'cyber-rain' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>

              <button
                onClick={() => setWeather('quantum-realm')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  weather === 'quantum-realm'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Orbit className="w-3.5 h-3.5 text-amber-400" /> Cổng Lượng Tử (Quantum)
                </span>
                {weather === 'quantum-realm' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>

              <button
                onClick={() => setWeather('none')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  weather === 'none'
                    ? 'bg-gray-500/20 text-gray-200 border border-gray-500/40'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-gray-400" /> Tắt hiệu ứng
                </span>
                {weather === 'none' && <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
              </button>
            </div>

            {/* Theme mode */}
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 pt-2 border-t border-gray-800 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-cyan-400" /> Chế Độ Màu Sắc
            </h4>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <button
                onClick={() => setTheme('avengers-4k')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition border ${
                  theme === 'avengers-4k'
                    ? 'bg-gradient-to-r from-red-600/30 to-amber-600/30 text-amber-300 border-amber-500/50'
                    : 'bg-[#161F30] text-gray-400 border-gray-800'
                }`}
              >
                Avengers 4K
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition border ${
                  theme === 'dark'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-[#161F30] text-gray-400 border-gray-800'
                }`}
              >
                Tối Deep
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition border ${
                  theme === 'light'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                    : 'bg-[#161F30] text-gray-400 border-gray-800'
                }`}
              >
                Sáng Dịu
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
