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

  // States for 20-lesson master curriculum library
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
    showToast(`Loaded lesson "${deck.title}" successfully!`);
  };

  const handleAddAllCurriculum = () => {
    let count = 0;
    for (const deck of ALL_CURRICULUM_DECKS) {
      if (!decks.some((d) => d.package_id === deck.package_id)) {
        if (onAddDeck) onAddDeck(deck);
        count++;
      }
    }
    showToast(`Loaded all 20 curriculum lessons (${count} new decks) into library!`);
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
    const sampleWord = newLang === 'zh-CN' ? '你好' : (newLang === 'en' ? 'Hello' : 'Hello');
    const samplePhonetic = newLang === 'zh-CN' ? 'nǐ hǎo' : (newLang === 'en' ? '/həˈloʊ/' : 'hello');
    const sampleType = newLang === 'zh-CN' ? 'nihao' : (newLang === 'en' ? 'hello' : 'hello');

    const newPkg: LearningPackage = {
      package_id: uniqueId,
      title,
      created_at: new Date().toISOString(),
      source_filename: 'manual_created.txt',
      vocabulary_deck: {
        id: `deck_v_${Date.now()}`,
        title,
        description: newDesc.trim() || 'Custom created vocabulary deck',
        target_language: newLang,
        items: [
          {
            id: `v_${Date.now()}_1`,
            target_text: sampleWord,
            phonetic: samplePhonetic,
            type_target: sampleType,
            meaning: 'Hello',
            difficulty: 1,
            stroke_gesture: 'horizontal',
            characters: newLang === 'zh-CN' ? ['你', '好'] : undefined
          }
        ]
      },
      quiz_deck: {
        id: `deck_q_${Date.now()}`,
        title: `Quiz: ${title}`,
        description: 'Reflex reaction quiz items',
        items: [
          {
            id: `q_${Date.now()}_1`,
            question: `What is the correct meaning of "${sampleWord}"?`,
            options: ['A. Hello', 'B. Goodbye', 'C. Thank you', 'D. Sorry'],
            correct_index: 0,
            explanation: 'Fundamental greeting phrase.',
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
    showToast(`Created custom deck "${title}"! Opening editor...`);
    onNavigateTab('upload');
  };

  const handleConfirmDelete = () => {
    if (onDeleteDeck) {
      onDeleteDeck(activeDeck.package_id);
    }
    setIsConfirmDeleteOpen(false);
    showToast(`Successfully deleted learning deck!`);
  };
  return (
    <div className="space-y-6 sm:space-y-10 py-2 w-full mx-auto">
      {/* 4K Cinematic Avengers Hero Banner (Responsive on Mobile, Tablet & 4K) */}
      <div 
        id="tour-hero-banner"
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 group min-h-[380px] sm:min-h-[460px] 2xl:min-h-[520px] 3xl:min-h-[580px] flex items-center"
      >
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
            <span>AVENGERS 4K ULTRA-HD EDITION • NEXT-GEN AI LEARNING PLATFORM</span>
          </div>

          <h1 className="font-game text-2xl sm:text-4xl lg:text-5xl 3xl:text-6xl font-black text-white leading-tight tracking-wide drop-shadow-md">
            TRANSFORM ANY DOCUMENT INTO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-red-500">
              EPIC SUPERHERO BATTLES
            </span>
          </h1>

          <p className="mt-3 sm:mt-5 text-xs sm:text-base 3xl:text-lg text-gray-200 leading-relaxed max-w-2xl drop-shadow">
            Upload <span className="text-cyan-300 font-bold">PDF, DOCX, Scanned Images</span> or paste text. 
            Gemini AI will instantly analyze vocabulary, syntax, and quiz questions into 4K gaming arenas: 
            <span className="text-amber-300 font-bold"> Iron Man Space Shooter</span>, 
            <span className="text-pink-300 font-bold"> Doctor Strange Magic Touch</span>, 
            <span className="text-emerald-300 font-bold"> Stark Tech Speed Quiz</span>, 
            <span className="text-red-400 font-bold"> Scarlet Ghost Forest 3D</span>, and 
            <span className="text-blue-400 font-bold"> 3D Multi-Dimensional Flashcards</span>!
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              id="tour-hero-btn-upload"
              onClick={() => onNavigateTab('upload')}
              className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm 3xl:text-base transition shadow-xl shadow-cyan-500/30 cursor-pointer hover:scale-105 min-h-[48px]"
            >
              <Sparkles className="w-5 h-5 text-black shrink-0" />
              <span>Create AI Game From File</span>
            </button>

            <button
              onClick={() => onNavigateTab('chicken-shooter')}
              className="flex items-center justify-center gap-2 bg-[#0B0F19]/80 hover:bg-[#161F30] text-white font-bold px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm 3xl:text-base border border-cyan-500/40 hover:border-cyan-400 transition shadow-lg backdrop-blur-md min-h-[48px]"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400 shrink-0" />
              <span>Enter Battle (4K)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Game Modes Showcase with Responsive Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-4 sm:mb-6">
          <div>
            <h2 className="font-game text-lg sm:text-xl 3xl:text-2xl font-bold text-white tracking-wider flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              HIGH-FIDELITY GAMIFIED LEARNING ARENAS (4K)
            </h2>
            <p className="text-xs 3xl:text-sm text-gray-400 mt-0.5">Elevate vocabulary memorization with Hollywood blockbuster visuals and AAA game mechanics</p>
          </div>
        </div>

        <div 
          id="tour-games-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 3xl:gap-6"
        >
          {/* Game 1: Chicken Shooter */}
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
                  STARK GALAXY TYPIST
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Stark Nano-Armor interceptor engaging drone fleets. Type words with precision to unleash particle laser strikes and master rapid spelling reflexes!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-amber-400 min-h-[36px]">
                <span>Enter Cockpit</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>

          {/* Game 2: Magic Touch */}
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
                  DOCTOR STRANGE MYSTIC RUNE
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Draw mystic gesture runes (—, |, /, \, V, ^, O, ⚡) with Eldritch spark particle VFX to slice flying balloons and build Chinese Hanzi stroke intuition.
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-pink-400 min-h-[36px]">
                <span>Cast Mystic Runes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>

          {/* Game 3: Speed Quiz Arena */}
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
                  Stark Tech rapid-fire trivia challenge. Test comprehensive vocabulary grasp and rack up combo multipliers before the clock expires!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-emerald-400 min-h-[36px]">
                <span>Enter Arena</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>

          {/* Game 4: Granny Escape 3D */}
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
                  SCARLET GHOST FOREST 3D
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  Immersive 3-tier forest graphics. Toggle flashlight, evade the stalking Granny specter, and collect ancient Hanzi glyphs to unlock the sanctuary portal!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-red-400 min-h-[36px]">
                <span>Enter Forest</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>

          {/* Game 5: Flashcard 3D Arena */}
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
                  3D MULTI-DIMENSIONAL FLASHCARD
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  360° flip cards with stroke-by-stroke dissection, native pronunciation audio, and Spaced Repetition SRS optimization!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs font-bold text-blue-400 min-h-[36px]">
                <span>Open Flashcards</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Learning Deck Card */}
      <div 
        id="tour-deck-selector"
        className="bg-[#161F30]/90 border border-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 3xl:p-10 shadow-xl backdrop-blur-md"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Active Learning Deck
                </span>
                <span className="text-[11px] sm:text-xs text-gray-400">
                  {activeDeck.vocabulary_deck?.items?.length || 0} words • {activeDeck.quiz_deck?.items?.length || 0} quiz items
                </span>
              </div>
              <h3 className="text-lg sm:text-xl 3xl:text-2xl font-bold text-white mt-1.5">{activeDeck.title}</h3>
              <p className="text-xs 3xl:text-sm text-gray-400 mt-0.5">{activeDeck.vocabulary_deck?.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            {/* Deck Selector Dropdown */}
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
                    📚 {d.title} ({d.vocabulary_deck?.items?.length || 0} words)
                  </option>
                ))}
              </select>
            </div>

            {/* Add New Deck */}
            <button
              onClick={() => setIsAddDeckModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/35 hover:to-teal-500/35 border border-emerald-400/60 text-emerald-300 hover:text-emerald-100 text-xs 3xl:text-sm font-bold transition min-h-[44px] shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
              title="Add or create a new learning deck"
            >
              <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Add Deck</span>
            </button>

            {/* Edit Deck */}
            <button
              onClick={() => onNavigateTab('upload')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-700 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-xs 3xl:text-sm font-semibold text-gray-300 hover:text-cyan-300 transition min-h-[44px] cursor-pointer"
              title="Edit vocabulary and quizzes in this deck"
            >
              <Edit3 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Edit Deck</span>
            </button>

            {/* Delete Deck */}
            <button
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-red-500/40 hover:border-red-400 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-100 text-xs 3xl:text-sm font-bold transition min-h-[44px] cursor-pointer hover:scale-105 active:scale-95"
              title="Delete active learning deck"
            >
              <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
              <span>Delete Deck</span>
            </button>

            {/* Play Now */}
            <button
              onClick={() => onNavigateTab('chicken-shooter')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black text-xs 3xl:text-sm font-black transition shadow-lg shadow-cyan-500/25 min-h-[44px] cursor-pointer hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-black shrink-0" />
              <span>Play Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add New Vocabulary Deck / 20 Master Curriculum Decks */}
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
                    <span>Curated Lesson Vault & Add Deck</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      20 Lessons • 400 Core Words
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">Explore structured Chinese HSK 1 - HSK 3 & Specialized English curriculum, or build custom decks</p>
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
                  <span>Curated 20 Master Lessons</span>
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
                  <span>Create Custom Deck</span>
                </button>
              </div>

              {activeModalTab === 'library' && (
                <button
                  type="button"
                  onClick={handleAddAllCurriculum}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-400/50 text-amber-300 text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                  title="Load all 20 curriculum decks into your study list"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>⚡ Load All 20 Decks Into Library</span>
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
                      All (20)
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
                      🇨🇳 HSK 1 (6 Decks)
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
                      🇨🇳 HSK 2 (5 Decks)
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
                      🇨🇳 HSK 3 (3 Decks)
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
                      🇬🇧 English (6 Decks)
                    </button>
                  </div>

                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search lessons or vocabulary..."
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
                                {deck.vocabulary_deck.items.length} words
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {deck.quiz_deck.items.length} quizzes
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
                                Active Learning Deck
                              </span>
                            ) : isAlreadyInList ? (
                              <span className="text-[11px] text-emerald-400 font-medium">
                                ✓ In Your Library
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-500">
                                Curated Master Lesson
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
                              <span>{isCurrent ? 'Study Now' : '+ Load Deck'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredCurriculum.length === 0 && (
                    <div className="py-12 text-center text-gray-400 text-xs">
                      No lessons found matching "{searchQuery}".
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
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Deck Title (*):</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g.: HSK 2 Core Vocabulary, IELTS Speaking, Tech Vocabulary..."
                      className="w-full bg-[#0B0F19] border border-gray-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Target Language:</label>
                      <select
                        value={newLang}
                        onChange={(e) => setNewLang(e.target.value)}
                        className="w-full bg-[#0B0F19] border border-gray-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition"
                      >
                        <option value="zh-CN">🇨🇳 Chinese (zh-CN)</option>
                        <option value="en">🇬🇧 English (en)</option>
                        <option value="vi-VN">🇻🇳 Vietnamese (vi-VN)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Lesson Description:</label>
                      <input
                        type="text"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Describe learning goals for this deck..."
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
                    Or upload PDF/Scan/Word files for automatic AI extraction &rarr;
                  </button>

                  <button
                    type="submit"
                    disabled={!newTitle.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Create & Edit Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Confirm Delete Deck */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#121826] border border-red-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white">Confirm Deck Deletion</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Are you sure you want to delete the deck <span className="font-bold text-red-400">"{activeDeck.title}"</span>?
              </p>
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-gray-800 text-left text-xs text-gray-400 space-y-1">
                <div>• Vocabulary: <span className="text-white font-bold">{activeDeck.vocabulary_deck?.items?.length || 0} words</span></div>
                <div>• Quiz items: <span className="text-white font-bold">{activeDeck.quiz_deck?.items?.length || 0} quizzes</span></div>
                <div>• Language: <span className="text-cyan-300 font-mono">{activeDeck.vocabulary_deck?.target_language || 'Undefined'}</span></div>
              </div>
              <p className="text-[11px] text-gray-500">
                Note: This deck will be permanently removed from your library and local storage.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 hover:border-gray-500 text-xs font-bold text-gray-300 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
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
