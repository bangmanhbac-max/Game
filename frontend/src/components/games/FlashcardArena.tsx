import React, { useState } from 'react';
import { 
  RotateCw, 
  Volume2, 
  CheckCircle, 
  ArrowLeft, 
  Layers, 
  Sparkles, 
  RefreshCw,
  Trophy
} from 'lucide-react';
import { VocabularyItem, LearningPackage } from '../../types/learning_content';

interface FlashcardArenaProps {
  vocabularyItems?: VocabularyItem[];
  packageData?: LearningPackage;
  onBackToMenu?: () => void;
  onBackToDashboard?: () => void;
  onRecordScore?: (score: number, accuracy: number, wordsDefeated: number) => void;
}

export const FlashcardArena: React.FC<FlashcardArenaProps> = ({
  vocabularyItems = [],
  packageData,
  onBackToMenu,
  onBackToDashboard,
  onRecordScore
}) => {
  const handleExit = onBackToDashboard || onBackToMenu || (() => {});
  const activeItems = packageData?.vocabulary_deck.items || vocabularyItems;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentItem = activeItems[currentIndex] || activeItems[0];
  const progressPercent = Math.round(((currentIndex + (isFinished ? 1 : 0)) / (activeItems.length || 1)) * 100);

  const speakWord = (text: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      if (/[\u4e00-\u9fff]/.test(text)) {
        utterance.lang = 'zh-CN';
      } else {
        utterance.lang = 'en-US';
      }
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const handleNext = (mastered: boolean) => {
    if (mastered) {
      setMasteredCount((c) => c + 1);
    } else {
      setReviewCount((c) => c + 1);
    }

    setIsFlipped(false);
    if (currentIndex + 1 < activeItems.length) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      setIsFinished(true);
      const acc = Math.round(((masteredCount + (mastered ? 1 : 0)) / (activeItems.length || 1)) * 100);
      onRecordScore?.(masteredCount * 100, acc, activeItems.length);
    }
  };

  const restartDeck = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredCount(0);
    setReviewCount(0);
    setIsFinished(false);
  };

  if (!currentItem) {
    return (
      <div className="p-8 text-center text-white">
        <p>Chưa có từ vựng nào trong bộ thẻ.</p>
        <button onClick={handleExit} className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">
          Về Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleExit}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#161F30] hover:bg-[#1f2b42] border border-gray-700 text-xs font-bold text-gray-300 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Về Danh Sách Game
        </button>

        <div className="flex items-center gap-2 bg-[#161F30] border border-cyan-500/30 rounded-2xl px-4 py-2 text-xs text-cyan-300 font-mono font-bold">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Thẻ: {currentIndex + 1} / {vocabularyItems.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-[#161F30] overflow-hidden border border-gray-800">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* 3D Flip Card Container */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full h-80 rounded-3xl cursor-pointer perspective-1000 select-none group"
          >
            <div
              className={`relative w-full h-full transition-transform duration-500 rounded-3xl p-8 shadow-2xl border-2 flex flex-col justify-between ${
                isFlipped
                  ? 'bg-gradient-to-br from-[#1a1c2e] to-[#0f172a] border-purple-500/50'
                  : 'bg-gradient-to-br from-[#131b2e] to-[#0b101c] border-cyan-500/40 hover:border-cyan-400'
              }`}
            >
              {/* Card Top Pill */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {isFlipped ? 'MẶT SAU: Ý NGHĨA & VÍ DỤ' : 'MẶT TRƯỚC: TỪ VỰNG GỐC'}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentItem.target_text);
                  }}
                  className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition cursor-pointer"
                  title="Phát âm từ vựng"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Card Body */}
              {!isFlipped ? (
                // Front Side
                <div className="text-center space-y-3">
                  <h2 className="text-5xl font-black text-white tracking-wider font-mono">
                    {currentItem.target_text}
                  </h2>
                  <p className="text-lg font-mono text-cyan-300 italic">
                    {currentItem.phonetic}
                  </p>

                  {/* Character breakdown */}
                  {currentItem.characters && currentItem.characters.length > 0 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="text-xs text-gray-400 font-semibold">Chữ cấu thành:</span>
                      {currentItem.characters.map((c, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 text-sm font-bold border border-cyan-500/30 font-mono">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Back Side
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black text-amber-300">
                    {currentItem.meaning}
                  </h3>
                  {currentItem.example && (
                    <p className="text-sm text-gray-300 bg-[#0B0F19]/60 p-3 rounded-2xl border border-gray-800 leading-relaxed">
                      {currentItem.example}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-2">
                    <span>Độ khó: {Array.from({ length: currentItem.difficulty }).map(() => '⭐').join('')}</span>
                    <span>Gõ phím: <strong className="text-cyan-400 font-mono">{currentItem.type_target}</strong></span>
                  </div>
                </div>
              )}

              {/* Card Bottom Hint */}
              <div className="text-center">
                <span className="text-xs text-gray-500 group-hover:text-cyan-400 transition flex items-center justify-center gap-1.5 font-medium">
                  <RotateCw className="w-3.5 h-3.5" /> Nhấp vào thẻ để lật mặt
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons (Spaced Repetition) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleNext(false)}
              className="py-4 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔴 Cần Ôn Lại (Chưa nhớ)</span>
            </button>
            <button
              onClick={() => handleNext(true)}
              className="py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>🟢 Đã Thuộc Lòng (Tiếp theo)</span>
            </button>
          </div>
        </div>
      ) : (
        /* FINISHED SUMMARY SCREEN */
        <div className="bg-[#121c2e] border-2 border-emerald-500/50 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mx-auto text-emerald-400">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">XUẤT SẮC! HOÀN THÀNH BỘ FLASHCARD</h2>
            <p className="text-sm text-gray-400 mt-1">Bạn đã duyệt qua toàn bộ {activeItems.length} thẻ từ vựng.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="bg-[#0b0f19] p-4 rounded-2xl border border-emerald-500/30">
              <span className="text-2xl font-black text-emerald-400 block">{masteredCount}</span>
              <span className="text-xs text-gray-400 font-semibold">Đã thuộc làu</span>
            </div>
            <div className="bg-[#0b0f19] p-4 rounded-2xl border border-red-500/30">
              <span className="text-2xl font-black text-red-400 block">{reviewCount}</span>
              <span className="text-xs text-gray-400 font-semibold">Cần ôn lại</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={restartDeck}
              className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Học Lại Bộ Này
            </button>
            <button
              onClick={handleExit}
              className="px-6 py-3 rounded-2xl bg-[#1e293b] hover:bg-[#334155] text-gray-300 font-bold text-sm transition cursor-pointer"
            >
              Về Danh Sách Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
