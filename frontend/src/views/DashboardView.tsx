import React, { useState } from 'react';
import { 
  Sparkles, 
  Gamepad2, 
  ArrowRight, 
  BookOpen, 
  Zap, 
  Trophy, 
  Play, 
  Shield, 
  Flame, 
  Compass, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  AlertTriangle, 
  Wand2,
  Search,
  Library,
  Ghost,
  Layers
} from 'lucide-react';
import { LearningPackage } from '../types/learning_content';
import { ActiveTab } from '../components/Navbar';
import { ALL_CURRICULUM_DECKS } from '../lib/curriculumData';

interface DashboardViewProps {
  decks: LearningPackage[];
  activeDeck: LearningPackage;
  onSelectDeck: (deck: LearningPackage) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onDeleteDeck?: (packageId: string) => void;
  onAddDeck?: (deck: LearningPackage) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  decks,
  activeDeck,
  onSelectDeck,
  onNavigateTab,
  onDeleteDeck,
  onAddDeck,
}) => {
  const [isAddDeckModalOpen, setIsAddDeckModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLang, setNewLang] = useState('zh-CN');
  const [newDesc, setNewDesc] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States cho thư viện 20 bộ bài học
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hsk1' | 'hsk2' | 'hsk3' | 'english'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalTab, setActiveModalTab] = useState<'library' | 'manual'>('library');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectCurriculumDeck = (deck: LearningPackage) => {
    if (onAddDeck && !decks.some((d) => d.package_id === deck.package_id)) {
      onAddDeck(deck);
    }
    onSelectDeck(deck);
    setIsAddDeckModalOpen(false);
    showToast(`Đã nạp bài học "${deck.title}" thành công!`);
  };

  const handleAddAllCurriculum = () => {
    let count = 0;
    for (const deck of ALL_CURRICULUM_DECKS) {
      if (!decks.some((d) => d.package_id === deck.package_id)) {
        if (onAddDeck) onAddDeck(deck);
        count++;
      }
    }
    showToast(`Đã nạp toàn bộ 20 bộ bài học (${count} bài mới) vào hệ thống!`);
  };

  const filteredCurriculum = ALL_CURRICULUM_DECKS.filter((deck) => {
    const matchesCat = 
      selectedCategory === 'all' ||
      (selectedCategory === 'hsk1' && deck.package_id.startsWith('hsk1')) ||
      (selectedCategory === 'hsk2' && deck.package_id.startsWith('hsk2')) ||
      (selectedCategory === 'hsk3' && deck.package_id.startsWith('hsk3')) ||
      (selectedCategory === 'english' && deck.package_id.startsWith('en'));
    
    const matchesQuery = 
      !searchQuery.trim() ||
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.vocabulary_deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.vocabulary_deck.items.some((it) => 
        it.target_text.toLowerCase().includes(searchQuery.toLowerCase()) || 
        it.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.phonetic.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesCat && matchesQuery;
  });

  const handleCreateManualDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const title = newTitle.trim();
    const uniqueId = `pkg_custom_${Date.now()}`;
    const sampleWord = newLang === 'zh-CN' ? '你好' : (newLang === 'en' ? 'Hello' : 'Xin chào');
    const samplePhonetic = newLang === 'zh-CN' ? 'nǐ hǎo' : (newLang === 'en' ? '/həˈloʊ/' : 'xin chao');
    const sampleType = newLang === 'zh-CN' ? 'nihao' : (newLang === 'en' ? 'hello' : 'xinchao');

    const newPkg: LearningPackage = {
      package_id: uniqueId,
      title,
      created_at: new Date().toISOString(),
      source_filename: 'manual_created.txt',
      vocabulary_deck: {
        id: `deck_v_${Date.now()}`,
        title,
        description: newDesc.trim() || 'Bộ từ vựng tạo thủ công',
        target_language: newLang,
        items: [
          {
            id: `v_${Date.now()}_1`,
            target_text: sampleWord,
            phonetic: samplePhonetic,
            type_target: sampleType,
            meaning: 'Xin chào',
            difficulty: 1,
            stroke_gesture: 'horizontal',
            characters: newLang === 'zh-CN' ? ['你', '好'] : undefined
          }
        ]
      },
      quiz_deck: {
        id: `deck_q_${Date.now()}`,
        title: `Quiz: ${title}`,
        description: 'Bộ câu hỏi trắc nghiệm kiểm tra phản xạ',
        items: [
          {
            id: `q_${Date.now()}_1`,
            question: `Ý nghĩa chính xác của "${sampleWord}" là gì?`,
            options: ['A. Xin chào', 'B. Tạm biệt', 'C. Cảm ơn', 'D. Xin lỗi'],
            correct_index: 0,
            explanation: 'Từ chào hỏi căn bản nhất.',
            points: 100
          }
        ]
      }
    };

    if (onAddDeck) {
      onAddDeck(newPkg);
    }
    onSelectDeck(newPkg);
    setIsAddDeckModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    showToast(`Đã tạo bộ từ "${title}"! Đang mở trình biên tập...`);
    onNavigateTab('upload');
  };

  const handleConfirmDelete = () => {
    if (onDeleteDeck) {
      onDeleteDeck(activeDeck.package_id);
    }
    setIsConfirmDeleteOpen(false);
    showToast(`Đã xóa bộ bài học thành công!`);
  };
  return (
    <div className="space-y-6 sm:space-y-10 py-2 w-full mx-auto">
      {/* 4K Cinematic Avengers Hero Banner (Responsive on Mobile, Tablet & 4K) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 group min-h-[380px] sm:min-h-[460px] 2xl:min-h-[520px] 3xl:min-h-[580px] flex items-center">
        {/* 4K Avengers Wallpaper Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url('/assets/avengers_4k.jpg')" }}
        />

        {/* Cinematic Multi-Layer Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070A12] via-[#0B0F19]/90 sm:via-[#0B0F19]/85 to-[#070A12]/75 sm:to-[#070A12]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] via-transparent to-[#070A12]/40" />

        {/* Glowing Arc Reactor Ambient Flares */}
        <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 sm:w-80 h-64 sm:h-80 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl p-5 sm:p-8 lg:p-14 3xl:p-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[10px] sm:text-xs 3xl:text-sm font-black mb-3 sm:mb-5 shadow-lg shadow-cyan-500/20 backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 animate-pulse" />
            <span>AVENGERS 4K ULTRA-HD EDITION • NỀN TẢNG HỌC TẬP THẾ HỆ MỚI</span>
          </div>

          <h1 className="font-game text-2xl sm:text-4xl lg:text-5xl 3xl:text-6xl font-black text-white leading-tight tracking-wide drop-shadow-md">
            BIẾN MỌI TÀI LIỆU THÀNH <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-red-500">
              TRẬN CHIẾN SIÊU ANH HÙNG
            </span>
          </h1>

          <p className="mt-3 sm:mt-5 text-xs sm:text-base 3xl:text-lg text-gray-200 leading-relaxed max-w-2xl drop-shadow">
            Nạp file <span className="text-cyan-300 font-bold">PDF, DOCX, Ảnh chụp</span> hoặc dán nội dung. 
            AI sẽ tức tốc phân tích và biến tài liệu thành các đấu trường đồ họa chân thực: 
            <span className="text-amber-300 font-bold"> Iron Man Space Shooter</span>, 
            <span className="text-pink-300 font-bold"> Doctor Strange Magic Touch</span>, 
            <span className="text-emerald-300 font-bold"> Stark Tech Speed Quiz</span>, 
            <span className="text-red-400 font-bold"> Trốn Thoát Rừng Ma 3D</span> và 
            <span className="text-blue-400 font-bold"> Flashcard 3D Đa Chiều</span>!
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigateTab('upload')}
              className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm 3xl:text-base transition shadow-xl shadow-cyan-500/30 cursor-pointer hover:scale-105 min-h-[48px]"
            >
              <Sparkles className="w-5 h-5 text-black shrink-0" />
              <span>Nạp File Tạo Game Với AI</span>
            </button>

            <button
              onClick={() => onNavigateTab('chicken-shooter')}
              className="flex items-center justify-center gap-2 bg-[#0B0F19]/80 hover:bg-[#161F30] text-white font-bold px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm 3xl:text-base border border-cyan-500/40 hover:border-cyan-400 transition shadow-lg backdrop-blur-md min-h-[48px]"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400 shrink-0" />
              <span>Tham Chiến Ngay (4K)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Game Modes Showcase with Responsive Grid (1 col Mobile, 2 col Tablet, 3 col Medium, 5 col Desktop) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-4 sm:mb-6">
          <div>
            <h2 className="font-game text-lg sm:text-xl 3xl:text-2xl font-bold text-white tracking-wider flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              CÁC ĐẤU TRƯỜNG GAMING ĐỒ HỌA CAO (4K)
            </h2>
            <p className="text-xs 3xl:text-sm text-gray-400 mt-0.5">Nâng tầm trải nghiệm học từ vựng với visual bom tấn Hollywood</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 3xl:gap-6">
          {/* Game 1: Chicken Shooter (Iron Man Space Invaders) */}
          <div
            onClick={() => onNavigateTab('chicken-shooter')}
            className="group relative overflow-hidden bg-[#161F30] border border-amber-500/30 hover:border-amber-400 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl hover:shadow-amber-500/20 flex flex-col justify-between"
          >
            {/* Card 4K Poster Thumbnail */}
            <div className="relative h-36 sm:h-40 3xl:h-48 w-full overflow-hidden">
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

            <div className="p-4 sm:p-5 3xl:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-game text-sm sm:text-base 3xl:text-lg font-bold text-amber-300 mb-2">
                  BẮN GÀ LUYỆN GÕ PHÍM
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Chiến đấu cơ Stark Nano-Armor đánh chặn đàn Drone mang từ vựng. Gõ đúng ký tự để khai hỏa tia Plasma!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-amber-400 min-h-[36px]">
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
            <div className="relative h-36 sm:h-40 3xl:h-48 w-full overflow-hidden">
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

            <div className="p-4 sm:p-5 3xl:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-game text-sm sm:text-base 3xl:text-lg font-bold text-pink-300 mb-2">
                  MAGIC TOUCH (VẼ PHÉP)
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Vẽ tự do nét phép thuật (—, |, /, \, V, ^, O, ⚡) với hiệu ứng tia lửa Eldritch để phá nổ bóng bay ma thuật!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-pink-400 min-h-[36px]">
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
            <div className="relative h-36 sm:h-40 3xl:h-48 w-full overflow-hidden">
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

            <div className="p-4 sm:p-5 3xl:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-game text-sm sm:text-base 3xl:text-lg font-bold text-emerald-300 mb-2">
                  SPEED QUIZ ARENA
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Đấu trường trắc nghiệm phản xạ nhanh Stark Tech. Đánh giá độ thông hiểu và tích lũy Combo liên hoàn!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-emerald-400 min-h-[36px]">
                <span>Vào Đấu Trường</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>

          {/* Game 4: Granny Escape 3D (Scarlet Witch Dark Multiverse) */}
          <div
            onClick={() => onNavigateTab('granny-forest')}
            className="group relative overflow-hidden bg-[#161F30] border border-red-500/40 hover:border-red-400 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl hover:shadow-red-500/30 flex flex-col justify-between"
          >
            {/* Card 4K Poster Thumbnail */}
            <div className="relative h-36 sm:h-40 3xl:h-48 w-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: "url('/assets/scarlet_witch_4k.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161F30] via-[#161F30]/40 to-transparent" />
              <div className="absolute top-3 left-3 bg-red-500/30 border border-red-400/60 backdrop-blur-md px-2.5 py-0.5 rounded-xl text-[11px] font-bold text-red-300 flex items-center gap-1.5">
                <Ghost className="w-3 h-3 text-red-300" />
                <span>SCARLET DARKHOLD</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 3xl:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-game text-sm sm:text-base 3xl:text-lg font-bold text-red-400 mb-2">
                  TRỐN THOÁT RỪNG MA 3D
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Đồ họa 3D FPS chân thực 4K. Bật đèn pin, né tránh ma quỷ Granny rình rập và nhặt cổ tự chữ Hán để mở khóa cổng!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-red-400 min-h-[36px]">
                <span>Vào Rừng Ma</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>

          {/* Game 5: Flashcard 3D Arena (Captain America Quantum Realm) */}
          <div
            onClick={() => onNavigateTab('flashcard')}
            className="group relative overflow-hidden bg-[#161F30] border border-blue-500/40 hover:border-blue-400 rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl hover:shadow-blue-500/30 flex flex-col justify-between"
          >
            {/* Card 4K Poster Thumbnail */}
            <div className="relative h-36 sm:h-40 3xl:h-48 w-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: "url('/assets/captain_america_4k.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161F30] via-[#161F30]/40 to-transparent" />
              <div className="absolute top-3 left-3 bg-blue-500/30 border border-blue-400/60 backdrop-blur-md px-2.5 py-0.5 rounded-xl text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-blue-300" />
                <span>QUANTUM REALM</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 3xl:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-game text-sm sm:text-base 3xl:text-lg font-bold text-blue-400 mb-2">
                  FLASHCARD 3D ĐA CHIỀU
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Thẻ 3D lật 360°, bóc tách từng nét bút chữ cứng, phát âm audio chuẩn và lặp lại ngắt quãng Spaced Repetition!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-blue-400 min-h-[36px]">
                <span>Mở Flashcard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Learning Deck Card */}
      <div className="bg-[#161F30]/90 border border-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 3xl:p-10 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Gói Bài Học Đang Chọn
                </span>
                <span className="text-[11px] sm:text-xs text-gray-400">
                  {activeDeck.vocabulary_deck?.items?.length || 0} từ vựng • {activeDeck.quiz_deck?.items?.length || 0} câu quiz
                </span>
              </div>
              <h3 className="text-lg sm:text-xl 3xl:text-2xl font-bold text-white mt-1.5">{activeDeck.title}</h3>
              <p className="text-xs 3xl:text-sm text-gray-400 mt-0.5">{activeDeck.vocabulary_deck?.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            {/* Bộ chọn danh sách các bộ bài học */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <select
                value={activeDeck.package_id}
                onChange={(e) => {
                  const found = decks.find((d) => d.package_id === e.target.value);
                  if (found) onSelectDeck(found);
                }}
                className="w-full bg-[#0B0F19] text-xs 3xl:text-sm text-cyan-300 font-bold px-3.5 py-2.5 rounded-xl border border-cyan-500/40 hover:border-cyan-400 focus:outline-none min-h-[44px] cursor-pointer shadow-inner"
              >
                {decks.map((d) => (
                  <option key={d.package_id} value={d.package_id} className="bg-[#0B0F19] text-white">
                    📚 {d.title} ({d.vocabulary_deck?.items?.length || 0} từ)
                  </option>
                ))}
              </select>
            </div>

            {/* Nút Thêm Bộ Từ Mới */}
            <button
              onClick={() => setIsAddDeckModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/35 hover:to-teal-500/35 border border-emerald-400/60 text-emerald-300 hover:text-emerald-100 text-xs 3xl:text-sm font-bold transition min-h-[44px] shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
              title="Thêm hoặc tạo một bộ từ vựng mới"
            >
              <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Thêm Bộ Từ</span>
            </button>

            {/* Nút Chỉnh Sửa Bộ Từ */}
            <button
              onClick={() => onNavigateTab('upload')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-700 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-xs 3xl:text-sm font-semibold text-gray-300 hover:text-cyan-300 transition min-h-[44px] cursor-pointer"
              title="Chỉnh sửa nội dung, thêm/xóa từ vựng trong bộ này"
            >
              <Edit3 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Chỉnh Sửa Bộ Từ</span>
            </button>

            {/* Nút Xóa Bộ Từ */}
            <button
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-red-500/40 hover:border-red-400 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-100 text-xs 3xl:text-sm font-bold transition min-h-[44px] cursor-pointer hover:scale-105 active:scale-95"
              title="Xóa bộ từ vựng đang chọn"
            >
              <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
              <span>Xóa Bộ Từ</span>
            </button>

            {/* Nút Chơi Ngay */}
            <button
              onClick={() => onNavigateTab('chicken-shooter')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black text-xs 3xl:text-sm font-black transition shadow-lg shadow-cyan-500/25 min-h-[44px] cursor-pointer hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-black shrink-0" />
              <span>Chơi Ngay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Thêm Bộ Từ Vựng Mới / Kho 20 Bài Học Chuẩn */}
      {isAddDeckModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-[#0f172a] border border-cyan-500/40 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>Kho Học Liệu Mẫu & Thêm Bộ Từ Vựng</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      20 Bài Học • 400 Từ Vựng Chuẩn
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">Khám phá lộ trình Tiếng Trung HSK 1 - HSK 3 và Tiếng Anh chuyên đề</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDeckModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs Inside Modal */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-800/80 pb-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalTab('library')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeModalTab === 'library'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Kho 20 Bài Học Chuẩn (Có Sẵn)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab('manual')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeModalTab === 'manual'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Tự Tạo Bộ Từ Thủ Công</span>
                </button>
              </div>

              {activeModalTab === 'library' && (
                <button
                  type="button"
                  onClick={handleAddAllCurriculum}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-400/50 text-amber-300 text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                  title="Thêm nhanh tất cả 20 bộ bài vào danh sách học"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>⚡ Nạp Toàn Bộ 20 Bộ Bài Vào Học</span>
                </button>
              )}
            </div>

            {/* TAB 1: THƯ VIỆN 20 BÀI HỌC CÓ SẴN */}
            {activeModalTab === 'library' && (
              <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                {/* Filter Category & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-white/20 text-white font-bold'
                          : 'bg-[#162032] text-gray-400 hover:text-white'
                      }`}
                    >
                      Tất Cả (20)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('hsk1')}
                      className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                        selectedCategory === 'hsk1'
                          ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400 font-bold'
                          : 'bg-[#162032] text-gray-400 hover:text-cyan-300'
                      }`}
                    >
                      🇨🇳 HSK 1 (6 bài)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('hsk2')}
                      className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                        selectedCategory === 'hsk2'
                          ? 'bg-blue-500/30 text-blue-300 border border-blue-400 font-bold'
                          : 'bg-[#162032] text-gray-400 hover:text-blue-300'
                      }`}
                    >
                      🇨🇳 HSK 2 (5 bài)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('hsk3')}
                      className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                        selectedCategory === 'hsk3'
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-400 font-bold'
                          : 'bg-[#162032] text-gray-400 hover:text-purple-300'
                      }`}
                    >
                      🇨🇳 HSK 3 (3 bài)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('english')}
                      className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                        selectedCategory === 'english'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-400 font-bold'
                          : 'bg-[#162032] text-gray-400 hover:text-amber-300'
                      }`}
                    >
                      🇬🇧 Tiếng Anh (6 bài)
                    </button>
                  </div>

                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm bài học hoặc từ vựng..."
                      className="w-full bg-[#0B0F19] border border-gray-700 focus:border-cyan-400 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Lesson Cards List */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredCurriculum.map((deck) => {
                      const isCurrent = activeDeck.package_id === deck.package_id;
                      const isAlreadyInList = decks.some((d) => d.package_id === deck.package_id);

                      return (
                        <div
                          key={deck.package_id}
                          className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between gap-3 ${
                            isCurrent
                              ? 'bg-[#16263f] border-cyan-400 shadow-md shadow-cyan-500/15'
                              : 'bg-[#131d2e] hover:bg-[#182438] border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-bold text-white leading-snug">
                                {deck.title}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-mono border border-cyan-500/30 shrink-0">
                                {deck.vocabulary_deck.target_language}
                              </span>
                            </div>

                            <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                              {deck.vocabulary_deck.description}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {deck.vocabulary_deck.items.length} từ vựng
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {deck.quiz_deck.items.length} câu quiz
                              </span>
                            </div>

                            {/* Word Sample Preview */}
                            <div className="mt-2.5 p-2 rounded-xl bg-[#090E17] border border-gray-800/80 text-[11px] text-gray-300 font-mono flex flex-wrap gap-1">
                              {deck.vocabulary_deck.items.slice(0, 6).map((w) => (
                                <span key={w.id} className="text-cyan-200">
                                  {w.target_text}
                                  <span className="text-gray-500"> ({w.meaning})</span>,
                                </span>
                              ))}
                              <span className="text-gray-500">...</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between gap-2">
                            {isCurrent ? (
                              <span className="text-xs text-cyan-300 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-cyan-400" />
                                Đang chọn học bài này
                              </span>
                            ) : isAlreadyInList ? (
                              <span className="text-[11px] text-emerald-400 font-medium">
                                ✓ Đã có trong danh sách
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-500">
                                Bài học mẫu có sẵn
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSelectCurriculumDeck(deck)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                isCurrent
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-sm'
                              }`}
                            >
                              <span>{isCurrent ? 'Học Ngay' : '+ Nạp Bài Này'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredCurriculum.length === 0 && (
                    <div className="py-12 text-center text-gray-400 text-xs">
                      Không tìm thấy bài học phù hợp với từ khóa "{searchQuery}".
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: TỰ TẠO BỘ TỪ THỦ CÔNG */}
            {activeModalTab === 'manual' && (
              <form onSubmit={handleCreateManualDeck} className="space-y-4 py-2 overflow-y-auto">
                <div className="p-4 rounded-2xl bg-[#131d2e] border border-gray-800 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Tên bộ từ vựng (*):</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Vd: Tiếng Trung HSK 2 Căn Bản, IELTS Speaking, Từ Vựng Lập Trình..."
                      className="w-full bg-[#0B0F19] border border-gray-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Ngôn ngữ mục tiêu:</label>
                      <select
                        value={newLang}
                        onChange={(e) => setNewLang(e.target.value)}
                        className="w-full bg-[#0B0F19] border border-gray-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition"
                      >
                        <option value="zh-CN">🇨🇳 Tiếng Trung (zh-CN)</option>
                        <option value="en">🇬🇧 Tiếng Anh (en)</option>
                        <option value="vi-VN">🇻🇳 Tiếng Việt (vi-VN)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Mô tả bài học:</label>
                      <input
                        type="text"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Mô tả mục tiêu của bộ bài học này..."
                        className="w-full bg-[#0B0F19] border border-gray-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddDeckModalOpen(false);
                      onNavigateTab('upload');
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Hoặc tải tài liệu PDF/Scan/Word để AI tự động trích xuất &rarr;
                  </button>

                  <button
                    type="submit"
                    disabled={!newTitle.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Tạo & Chỉnh Sửa Ngay
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Bộ Bài Học */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#121826] border border-red-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white">Xác Nhận Xóa Bộ Từ Vựng?</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Bạn có chắc chắn muốn xóa bộ từ vựng <span className="font-bold text-red-400">"{activeDeck.title}"</span>?
              </p>
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-gray-800 text-left text-xs text-gray-400 space-y-1">
                <div>• Số từ vựng: <span className="text-white font-bold">{activeDeck.vocabulary_deck?.items?.length || 0} từ</span></div>
                <div>• Số câu hỏi quiz: <span className="text-white font-bold">{activeDeck.quiz_deck?.items?.length || 0} câu</span></div>
                <div>• Ngôn ngữ: <span className="text-cyan-300 font-mono">{activeDeck.vocabulary_deck?.target_language || 'Chưa định nghĩa'}</span></div>
              </div>
              <p className="text-[11px] text-gray-500">
                Lưu ý: Dữ liệu bộ từ này sẽ bị gỡ khỏi danh sách và bộ nhớ máy.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 hover:border-gray-500 text-xs font-bold text-gray-300 hover:text-white transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#162032] border border-cyan-400 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-300">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
