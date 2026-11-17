import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  FileCheck,
  Cpu,
  Layers,
  ArrowRight,
  Play,
  Wand2,
  CheckCircle2,
  Zap,
  FolderOpen
} from 'lucide-react';
import { uploadDocument, generateLearningContent, DocumentExtractResult } from '../../lib/api';
import { LearningPackage } from '../../types/learning_content';
import { DEMO_CHINESE_DATA, DEMO_MESSY_DATA, DEMO_ENGLISH_DATA } from '../../lib/demoPackages';

interface DocumentUploadProps {
  onPackageGenerated: (pkg: LearningPackage) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onPackageGenerated }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [extractedDoc, setExtractedDoc] = useState<DocumentExtractResult | null>(null);
  const [vlmPackage, setVlmPackage] = useState<LearningPackage | null>(null);
  const [vlmStatus, setVlmStatus] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsExtracting(true);
    setVlmPackage(null);
    try {
      const userApiKey = localStorage.getItem('gemini_api_key') || undefined;
      const result = await uploadDocument(file, userApiKey, customPrompt.trim() || undefined);
      setExtractedDoc(result);
      setCustomText(result.raw_text);
      if (result.learning_package) {
        setVlmPackage(result.learning_package);
        onPackageGenerated(result.learning_package);
      }
      if (result.vlm_status) {
        setVlmStatus(result.vlm_status);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Cannot read file';
      setError(errorMsg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateAI = async () => {
    const textToProcess = customText.trim();
    if (!textToProcess) {
      setError('Please upload a document or paste text content');
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      const userApiKey = localStorage.getItem('gemini_api_key') || undefined;
      const pkg = await generateLearningContent(
        textToProcess,
        extractedDoc?.filename || 'Custom Document',
        userApiKey,
        customPrompt.trim() || undefined
      );
      setVlmPackage(pkg);
      onPackageGenerated(pkg);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error processing content with AI';
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadPredefinedDemo = (type: 'chinese' | 'messy' | 'english') => {
    setError(null);
    let demoData;
    if (type === 'chinese') {
      demoData = DEMO_CHINESE_DATA;
    } else if (type === 'messy') {
      demoData = DEMO_MESSY_DATA;
    } else {
      demoData = DEMO_ENGLISH_DATA;
    }

    setCustomText(demoData.rawText);
    setExtractedDoc({
      filename: demoData.filename,
      file_type: 'txt',
      char_count: demoData.rawText.length,
      raw_text: demoData.rawText,
      preview_snippet: demoData.rawText.slice(0, 300) + '...',
      learning_package: demoData.package,
      vlm_status: 'Predefined Offline Demo (No API Needed)'
    });
    setVlmPackage(demoData.package);
    setVlmStatus('Predefined Offline Demo (No API Needed)');
    onPackageGenerated(demoData.package);

    try {
      const localDecks: LearningPackage[] = JSON.parse(localStorage.getItem('eduplay_saved_decks') || '[]');
      const filtered = localDecks.filter(d => d.package_id !== demoData.package.package_id);
      filtered.unshift(demoData.package);
      localStorage.setItem('eduplay_saved_decks', JSON.stringify(filtered));
    } catch (e) {
      console.warn('Saved demo deck into localStorage:', e);
    }
  };

  const formatGesture = (gesture: string) => {
    switch (gesture) {
      case 'horizontal': return '— Horizontal';
      case 'vertical': return '| Vertical';
      case 'slash': return '/ Slash';
      case 'backslash': return '\\ Backslash';
      case 'v_shape': return 'V Shape';
      case 'caret': return '^ Caret';
      case 'circle': return '◯ Circle';
      case 'lightning': return '⚡ Lightning';
      default: return gesture;
    }
  };

  return (
    <div className="space-y-6">
      {/* VLM Multimodal Architecture Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0d1627] via-[#132038] to-[#1a1236] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                VLM Multimodal Architecture (Vision-Language Model)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Auto De-noise & Disentangle
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-wide">
              Parse Any Scanned Document, Photos, or Dense Cursive Text
            </h3>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              Whether your file has unspaced dense characters, multi-column messy formats, or skewed book photos, 
              our <span className="text-cyan-300 font-semibold">Vision Encoder</span> & <span className="text-purple-300 font-semibold">Language Decoder</span> pipeline automatically denoises, extracts, and normalizes into a 
              <span className="text-amber-300 font-semibold"> standardized interactive learning package</span> ready for all 5 games!
            </p>
          </div>

          {/* Mini Flow Pipeline Cards */}
          <div className="flex items-center gap-2 bg-[#0b101c]/80 p-3 rounded-2xl border border-gray-800 shrink-0">
            <div className="text-center px-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-1 border border-cyan-500/30">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-gray-300 font-medium block">Vision Encoder</span>
              <span className="text-[9px] text-cyan-400">Tokens Resizing</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            <div className="text-center px-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-1 border border-purple-500/30">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-gray-300 font-medium block">Context Decoder</span>
              <span className="text-[9px] text-purple-400">De-cluster Text</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            <div className="text-center px-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-1 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-gray-300 font-medium block">Fixed Schema</span>
              <span className="text-[9px] text-amber-400">5 Games & Quiz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Box (Method 1) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-gray-700 hover:border-cyan-500/50 bg-[#161F30]/60 hover:bg-[#161F30]'
        }`}
      >
        {/* Predefined Demo Button */}
        <div 
          className="absolute top-4 right-4 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => handleLoadPredefinedDemo('chinese')}
            className="group flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/25 via-orange-500/25 to-amber-500/25 hover:from-amber-500/40 hover:to-orange-500/40 border border-amber-400/60 text-amber-300 hover:text-amber-100 text-xs font-black transition-all shadow-lg shadow-amber-500/15 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            title="Automatically load and generate a sample HSK Chinese lesson without needing an API key"
          >
            <FolderOpen className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>📁 Instant Demo (No API Needed)</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-inner">
          {isExtracting ? (
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          {isExtracting ? (
            <span className="text-cyan-300 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              VLM Tokenizing, Denoising & Segmenting Vocabulary...
            </span>
          ) : (
            'Method 1: Drag & drop or click to upload any document into VLM'
          )}
        </h3>
        <p className="text-xs text-gray-400 max-w-lg mx-auto mb-4">
          Supports: <span className="text-cyan-300 font-semibold">PDF / Scanned Documents</span>,{' '}
          <span className="text-blue-300 font-semibold">Word DOCX</span>,{' '}
          <span className="text-amber-300 font-semibold">Photos / Textbook Scans (PNG/JPG)</span>, or{' '}
          <span className="text-emerald-300 font-semibold">Dense TXT files</span>.
        </p>

        {/* Format Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20">
            <FileText className="w-3.5 h-3.5" /> PDF (Vision OCR)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
            <FileText className="w-3.5 h-3.5" /> Word DOCX
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
            <ImageIcon className="w-3.5 h-3.5" /> Photos / Handwriting
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <FileText className="w-3.5 h-3.5" /> Dense TXT / MD
          </span>
        </div>

        {/* Offline Demo Buttons */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="pt-3 border-t border-gray-800/80 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Offline Demos (No API Key Required):
          </span>

          <button
            type="button"
            onClick={() => handleLoadPredefinedDemo('messy')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/25 to-purple-500/25 hover:from-pink-500/40 hover:to-purple-500/40 border border-pink-400/60 text-pink-200 text-xs font-bold transition shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Auto-extract and build complete vocabulary + quizzes from dense unspaced text without API key"
          >
            <Zap className="w-3.5 h-3.5 text-pink-300" />
            ⚡ Dense Text Demo
          </button>

          <button
            type="button"
            onClick={() => handleLoadPredefinedDemo('chinese')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/25 to-blue-500/25 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-400/60 text-cyan-200 text-xs font-bold transition shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Auto-generate complete Chinese HSK 1 vocabulary + quiz questions without API key"
          >
            <span>🇨🇳</span>
            ⚡ Chinese HSK Demo
          </button>

          <button
            type="button"
            onClick={() => handleLoadPredefinedDemo('english')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/25 to-indigo-500/25 hover:from-purple-500/40 hover:to-indigo-500/40 border border-purple-400/60 text-purple-200 text-xs font-bold transition shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Auto-generate complete English AI & Technology vocabulary + quizzes without API key"
          >
            <span>🇬🇧</span>
            ⚡ English AI & Tech Demo
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* VLM STANDARDIZED VOCABULARY TABLE */}
      {vlmPackage && (
        <div className="bg-[#121c2e] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white flex flex-wrap items-center gap-2">
                  <span>VLM Successfully Standardized Package!</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    {vlmPackage.vocabulary_deck.items.length} vocabulary • {vlmPackage.quiz_deck.items.length} quiz questions
                  </span>
                  {vlmStatus && (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[11px] font-mono border border-cyan-500/30">
                      {vlmStatus}
                    </span>
                  )}
                </h4>
                <p className="text-xs text-gray-400">
                  {vlmPackage.title} • Ready for Stark Galaxy Typist, Mystic Rune, and Speed Quiz
                </p>
              </div>
            </div>

            {/* Launch Game Button */}
            <button
              onClick={() => onPackageGenerated(vlmPackage)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Play Games With This Deck Now</span>
            </button>
          </div>

          {/* Vocabulary Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#0B0F19]">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#161F30] text-gray-400 uppercase font-semibold text-[11px] border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Target Text</th>
                  <th className="py-3 px-4">Phonetics (Pinyin/IPA)</th>
                  <th className="py-3 px-4">Components (Granny 3D)</th>
                  <th className="py-3 px-4">Type Target (Galaxy Shooter)</th>
                  <th className="py-3 px-4">English Meaning</th>
                  <th className="py-3 px-4">Stroke Gesture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {vlmPackage.vocabulary_deck.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-cyan-500/5 transition">
                    <td className="py-3 px-4 font-mono text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-cyan-300 text-sm">{item.target_text}</td>
                    <td className="py-3 px-4 font-mono text-amber-300 italic">{item.phonetic}</td>
                    <td className="py-3 px-4">
                      {item.characters && item.characters.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {item.characters.map((c, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-mono text-xs border border-blue-500/30">
                        {item.type_target}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{item.meaning}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-medium text-xs border border-purple-500/30">
                        {formatGesture(item.stroke_gesture)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      )}

      {/* User Custom AI Prompt Input */}
      <div className="bg-[#121c2e] border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold shrink-0">
          <Wand2 className="w-4 h-4 text-yellow-300" />
          <span>AI Instructions (Optional):</span>
        </div>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Custom AI prompt (e.g.: 'Focus on advanced business terms, extract character components and Pinyin, ignore English noise')..."
          className="flex-1 bg-[#0b0f19] border border-gray-700 focus:border-cyan-400 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition"
        />
        {customPrompt && (
          <button
            type="button"
            onClick={() => setCustomPrompt('')}
            className="text-gray-400 hover:text-white text-xs px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Direct Text / Editor Area */}
      <div className="bg-[#161F30] border border-gray-800 rounded-3xl p-6 shadow-xl">

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-white text-base">Source Text or Direct Input into VLM</h4>
          </div>
          {extractedDoc && (
            <span className="text-xs text-gray-400 bg-[#0B0F19] px-3 py-1 rounded-lg border border-gray-800">
              {extractedDoc.filename} ({extractedDoc.char_count} chars)
            </span>
          )}
        </div>

        <textarea
          rows={6}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Paste any study notes or lesson text here, even unspaced dense lines or messy paragraphs... VLM will automatically segment and standardize!"
          className="w-full bg-[#0B0F19] border border-gray-700 focus:border-cyan-400 rounded-2xl p-4 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-y transition font-mono leading-relaxed"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            💡 VLM automatically tokenizes Hanzi/English words, resolves Pinyin/IPA phonetics, cleans translations, and assigns gesture strokes.
          </p>

          <button
            onClick={handleGenerateAI}
            disabled={isGenerating || !customText.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-2xl text-sm transition shadow-lg shadow-purple-500/25 cursor-pointer disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>VLM Denoising & Structuring Content...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Activate VLM & Generate Game Decks</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
