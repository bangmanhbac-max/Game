import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AuthModal } from './components/auth/AuthModal';
import { LeaderboardModal } from './components/auth/LeaderboardModal';
import { AuthProvider } from './context/AuthContext';
import { VietnamStarCursor } from './components/effects/VietnamStarCursor';
import { DolphinCompanion } from './components/effects/DolphinCompanion';
import { DashboardView } from './views/DashboardView';
import { UploadStudioView } from './views/UploadStudioView';
import { ChickenShooterView } from './views/ChickenShooterView';
import { MagicTouchView } from './views/MagicTouchView';
import { QuizArenaView } from './views/QuizArenaView';
import { GrannyEscapeGame } from './components/games/GrannyEscapeGame';
import { FlashcardArena } from './components/games/FlashcardArena';
import { AtmosphereController } from './components/atmosphere/AtmosphereController';
import { AICopilotChatWidget } from './components/chat/AICopilotChatWidget';
import { DocumentsManagerModal } from './components/documents/DocumentsManagerModal';
import { WorldCommunityModal } from './components/community/WorldCommunityModal';
import { ContactModal } from './components/contact/ContactModal';
import { WebDatabaseAdminModal } from './components/admin/WebDatabaseAdminModal';
import { LearningPackage } from './types/learning_content';
import { fetchDecks } from './lib/api';
import { soundManager } from './games/common/SoundSynthesizer';

const DEFAULT_CHINESE_DECK: LearningPackage = {
  package_id: 'default-chinese-hsk1',
  title: 'Tiếng Trung Giao Tiếp HSK 1 Căn Bản',
  source_filename: 'tieng_trung_hsk1.pdf',
  created_at: new Date().toISOString(),
  vocabulary_deck: {
    id: 'deck-zh-default',
    title: 'Từ Vựng Tiếng Trung HSK 1',
    description: 'Các từ giao tiếp căn bản: Chào hỏi, cảm ơn, bạn bè, học tập',
    target_language: 'zh-CN',
    items: [
      { id: 'zh-1', target_text: '你好', phonetic: 'nǐ hǎo', type_target: 'nihao', meaning: 'Xin chào', difficulty: 1, stroke_gesture: 'horizontal', characters: ['你', '好'] },
      { id: 'zh-2', target_text: '谢谢', phonetic: 'xièxie', type_target: 'xiexie', meaning: 'Cảm ơn', difficulty: 1, stroke_gesture: 'vertical', characters: ['谢', '谢'] },
      { id: 'zh-3', target_text: '再见', phonetic: 'zàijiàn', type_target: 'zaijian', meaning: 'Tạm biệt', difficulty: 1, stroke_gesture: 'slash', characters: ['再', '见'] },
      { id: 'zh-4', target_text: '老师', phonetic: 'lǎoshī', type_target: 'laoshi', meaning: 'Thầy/Cô giáo', difficulty: 2, stroke_gesture: 'caret', characters: ['老', '师'] },
      { id: 'zh-5', target_text: '朋友', phonetic: 'péngyou', type_target: 'pengyou', meaning: 'Bạn bè', difficulty: 2, stroke_gesture: 'lightning', characters: ['朋', '友'] },
      { id: 'zh-6', target_text: '学习', phonetic: 'xuéxí', type_target: 'xuexi', meaning: 'Học tập', difficulty: 2, stroke_gesture: 'circle', characters: ['学', '习'] },
      { id: 'zh-7', target_text: '开心', phonetic: 'kāixīn', type_target: 'kaixin', meaning: 'Vui vẻ', difficulty: 1, stroke_gesture: 'v_shape', characters: ['开', '心'] },
      { id: 'zh-8', target_text: '苹果', phonetic: 'píngguǒ', type_target: 'pingguo', meaning: 'Quả táo', difficulty: 2, stroke_gesture: 'backslash', characters: ['苹', '果'] },
    ],
  },
  quiz_deck: {
    id: 'quiz-zh-default',
    title: 'Đấu Trường Quiz Tiếng Trung HSK 1',
    description: 'Thử thách phản xạ nghĩa từ vựng và pinyin',
    items: [
      {
        id: 'q1',
        question: "Từ '你好' (nǐ hǎo) có ý nghĩa là gì?",
        options: ['A. Tạm biệt', 'B. Xin chào', 'C. Cảm ơn', 'D. Không có chi'],
        correct_index: 1,
        explanation: "'你好' (nǐ hǎo) nghĩa là Xin chào trong tiếng Trung.",
        points: 100,
      },
      {
        id: 'q2',
        question: "Khi muốn nói 'Cảm ơn', bạn dùng từ nào?",
        options: ['A. 谢谢 (xièxie)', 'B. 再见 (zàijiàn)', 'C. 老师 (lǎoshī)', 'D. 学习 (xuéxí)'],
        correct_index: 0,
        explanation: "'谢谢' (xièxie) có nghĩa là Cảm ơn.",
        points: 100,
      },
      {
        id: 'q3',
        question: "Từ '苹果' (píngguǒ) nghĩa là gì?",
        options: ['A. Quả dưa hấu', 'B. Quả táo', 'C. Quả chuối', 'D. Quả xoài'],
        correct_index: 1,
        explanation: "'苹果' (píngguǒ) có nghĩa là Quả táo.",
        points: 100,
      },
    ],
  },
};

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [decks, setDecks] = useState<LearningPackage[]>([DEFAULT_CHINESE_DECK]);
  const [activeDeck, setActiveDeck] = useState<LearningPackage>(DEFAULT_CHINESE_DECK);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDbAdminOpen, setIsDbAdminOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDolphinActive, setIsDolphinActive] = useState(true);

  useEffect(() => {
    fetchDecks()
      .then((serverDecks) => {
        if (serverDecks && serverDecks.length > 0) {
          setDecks(serverDecks);
          setActiveDeck(serverDecks[0]);
        }
      })
      .catch(() => {
        // Fallback local deck
      });
  }, []);

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleDolphin = () => {
    setIsDolphinActive((prev) => !prev);
  };

  const handleSavePackage = (pkg: LearningPackage) => {
    setDecks((prev) => {
      const idx = prev.findIndex((d) => d.package_id === pkg.package_id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = pkg;
        return next;
      }
      return [pkg, ...prev];
    });
    setActiveDeck(pkg);
  };

  const handleSelectDeck = (deck: LearningPackage) => {
    setActiveDeck(deck);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
      {/* 4K Weather Atmosphere Controller (Cosmic Storm, Rain, Quantum) */}
      <AtmosphereController />

      {/* Vietnam Golden Star Cursor */}
      <VietnamStarCursor enabled={isDolphinActive} />

      {/* Dolphin Screen Companion */}
      <DolphinCompanion enabled={isDolphinActive} />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenDocuments={() => setIsDocumentsOpen(true)}
        onOpenCommunity={() => setIsCommunityOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenDbAdmin={() => setIsDbAdminOpen(true)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        isDolphinActive={isDolphinActive}
        onToggleDolphin={handleToggleDolphin}
      />

      {/* Main Container with Full Wide-Screen & 4K Scaling */}
      <main className="flex-1 w-full max-w-[98%] 2xl:max-w-[1950px] 3xl:max-w-[2400px] mx-auto px-2 sm:px-4 lg:px-6 py-6 relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardView
            decks={decks}
            activeDeck={activeDeck}
            onSelectDeck={handleSelectDeck}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'upload' && (
          <UploadStudioView
            currentPackage={activeDeck}
            onSavePackage={handleSavePackage}
            onLaunchGame={setActiveTab}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'chicken-shooter' && (
          <ChickenShooterView
            packageData={activeDeck}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'magic-touch' && (
          <MagicTouchView
            packageData={activeDeck}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'quiz-arena' && (
          <QuizArenaView
            packageData={activeDeck}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'granny-forest' && (
          <GrannyEscapeGame
            packageData={activeDeck}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'flashcard' && (
          <FlashcardArena
            packageData={activeDeck}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* AI Copilot Floating Assistant Widget */}
      <AICopilotChatWidget />

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#070A12] py-6 px-4 text-center text-xs 3xl:text-sm text-gray-500 relative z-10">
        <p>AI EduPlay Platform • Nền Tảng Học Tập Trò Chơi Hóa Thế Hệ Mới • 🛡️ Biệt Đội Avengers 4K & Hệ Thống Cơ Sở Dữ Liệu Toàn Diện</p>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Authentication Modal (Login / Register / OAuth) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {/* Documents & Decks Manager Modal */}
      <DocumentsManagerModal
        isOpen={isDocumentsOpen}
        onClose={() => setIsDocumentsOpen(false)}
        onSelectDeck={(deck: LearningPackage) => {
          handleSavePackage(deck);
          setActiveTab('dashboard');
        }}
      />

      {/* World Community & Friends Modal */}
      <WorldCommunityModal
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
      />

      {/* Contact Inquiry Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Web Database Admin Modal */}
      <WebDatabaseAdminModal
        isOpen={isDbAdminOpen}
        onClose={() => setIsDbAdminOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
