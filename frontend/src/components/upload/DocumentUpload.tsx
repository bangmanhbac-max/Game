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
  Zap
} from 'lucide-react';
import { uploadDocument, generateLearningContent, DocumentExtractResult } from '../../lib/api';
import { LearningPackage } from '../../types/learning_content';

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
      }
      if (result.vlm_status) {
        setVlmStatus(result.vlm_status);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể đọc file';
      setError(errorMsg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateAI = async () => {
    const textToProcess = customText.trim();
    if (!textToProcess) {
      setError('Vui lòng tải lên tài liệu hoặc dán nội dung văn bản');
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      const userApiKey = localStorage.getItem('gemini_api_key') || undefined;
      const pkg = await generateLearningContent(
        textToProcess,
        extractedDoc?.filename || 'Tài liệu tùy chỉnh',
        userApiKey,
        customPrompt.trim() || undefined
      );
      setVlmPackage(pkg);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi AI xử lý nội dung';
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };


  const formatGesture = (gesture: string) => {
    switch (gesture) {
      case 'horizontal': return '— Ngang';
      case 'vertical': return '| Sổ dọc';
      case 'slash': return '/ Phẩy';
      case 'backslash': return '\\ Mác';
      case 'v_shape': return 'V Chữ V';
      case 'caret': return '^ Mũ';
      case 'circle': return '◯ Tròn';
      case 'lightning': return '⚡ Tia sét';
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
                Cơ Chế VLM Đa Phương Thức (Vision-Language Model)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Auto De-noise & Disentangle
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-wide">
              Xử Lý Bất Kỳ Tài Liệu Scan, Ảnh Chụp Hoặc Dính Chữ
            </h3>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              Dù file của bạn chữ dính chùm không khoảng trắng, lộn xộn đa cột, hay ảnh chụp trang sách méo mó, 
              bộ giải mã <span className="text-cyan-300 font-semibold">Vision Encoder</span> & <span className="text-purple-300 font-semibold">Language Decoder</span> sẽ tự động khử nhiễu và phân tách về 
              <span className="text-amber-300 font-semibold"> 1 định dạng từ vựng cố định</span> để tạo game & câu hỏi ngay!
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
              <span className="text-[9px] text-purple-400">Tách Dính Chữ</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            <div className="text-center px-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-1 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-gray-300 font-medium block">Fixed Schema</span>
              <span className="text-[9px] text-amber-400">Tạo 3 Game & Quiz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Box (Cách 1: Tải file bất kỳ vào VLM) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-gray-700 hover:border-cyan-500/50 bg-[#161F30]/60 hover:bg-[#161F30]'
        }`}
      >
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
              VLM Đang Tokenize, Khử Nhiễu & Phân Tách Từ Vựng...
            </span>
          ) : (
            'Cách 1: Kéo thả hoặc Nhấp để tải file bất kỳ vào VLM'
          )}
        </h3>
        <p className="text-xs text-gray-400 max-w-lg mx-auto mb-4">
          Hỗ trợ: <span className="text-cyan-300 font-semibold">Tài liệu PDF / Scan</span>,{' '}
          <span className="text-blue-300 font-semibold">Word DOCX</span>,{' '}
          <span className="text-amber-300 font-semibold">Ảnh chụp trang sách (PNG/JPG)</span>, hoặc{' '}
          <span className="text-emerald-300 font-semibold">File TXT dính chữ</span>.
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
            <ImageIcon className="w-3.5 h-3.5" /> Ảnh / Chữ viết tay
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <FileText className="w-3.5 h-3.5" /> TXT / MD Dính Chữ
          </span>
        </div>

        {/* Quick Sample Presets */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="pt-3 border-t border-gray-800/80 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" /> Thử nhanh mẫu:
          </span>

          {/* PRESET THỬ DÍNH CHỮ LỘN XỘN ĐẶC BIỆT */}
          <button
            type="button"
            onClick={() => {
              const messy = `=== TÀI LIỆU SCAN DÍNH CHÙM LỘN XỘN (TEST VLM) ===
1.你好(nǐhǎo):Xinchào-Lờichàohỏicơbảnhàngngày.
2.谢谢(xièxie):Cảmơn-Biếtơnkhiđượcngườikhácgiúpđỡ.
3.不客气(búkèqi):Đừngkháchsáo-Khôngcóchi-Đápnhẹnhàng.
4.对不起(duìbuqǐ):Xinlỗi-Thànhthậtkhibảnthânmắclỗi.
5.没关系(méiguānxi):Khôngsaocả-Đápkhingườikhácxinlỗi.
6.再见(zàijiàn):Tạmbiệt-Hẹngặplạilầnsau.
7.老师(lǎoshī):Thầycôgiáo-Ngườitruyềnthụtrivàkiếnthức.
8.电脑(diànnǎo):Máyvitính-Thiếtbịcôngnghệthôngminh.
9.手机(shǒujī):Điệnthoạidiđộng-Phươngtiệnliênlạctiệndụng.
10.开心(kāixīn):Vuivẻ-Tâmtrạnghạnhphúcyêuđời.
Algorithm(/ˈæl.ɡə.rɪ.ðəm/):Thuậttoángiảiquyếtbàitoán
Database(/ˈdeɪ.tə.beɪs/):Cơsởdữliệulưutrữhệthống`;
              setCustomText(messy);
              setExtractedDoc({
                filename: 'file_dinh_chu_lon_xon_mau.txt',
                file_type: 'txt',
                char_count: messy.length,
                raw_text: messy,
                preview_snippet: '1.你好(nǐhǎo):Xinchào-Lờichàohỏicơbảnhàngngày...'
              });
              setVlmPackage(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-400/40 text-pink-300 text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-pink-400" />
            🧪 Test File Dính Chữ / Lộn Xộn
          </button>
          
          <button
            type="button"
            onClick={() => {
              const hsk = `1. 你好 (nǐ hǎo) : Xin chào - Lời chào hỏi cơ bản nhất hàng ngày.
2. 谢谢 (xièxie) : Cảm ơn - Thể hiện sự biết ơn khi nhận được sự giúp đỡ.
3. 不客气 (bú kèqi) : Đừng khách sáo / Không có chi - Đáp lại lời cảm ơn.
4. 对不起 (duìbuqǐ) : Xin lỗi - Dùng khi mắc lỗi hoặc cần làm phiền ai đó.
5. 没关系 (méi guānxi) : Không sao đâu - Lời đáp khi người khác xin lỗi mình.
6. 再见 (zàijiàn) : Tạm biệt - Hẹn gặp lại.
7. 老师 (lǎoshī) : Thầy cô giáo - Người giảng dạy và truyền đạt kiến thức.
8. 朋友 (péngyou) : Bạn bè - Những người bạn thân thiết.
9. 学习 (xuéxí) : Học tập - Trau dồi kiến thức mới mỗi ngày.
10. 开心 (kāixīn) : Vui vẻ - Cảm giác hạnh phúc, yêu đời.`;
              setCustomText(hsk);
              setExtractedDoc({
                filename: 'tu_vung_tieng_trung_mau.txt',
                file_type: 'txt',
                char_count: hsk.length,
                raw_text: hsk,
                preview_snippet: '你好 (nǐ hǎo) : Xin chào...'
              });
              setVlmPackage(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition shadow-sm"
          >
            🇨🇳 Tiếng Trung HSK
          </button>

          <button
            type="button"
            onClick={() => {
              const eng = `1. Algorithm (/ˈæl.ɡə.rɪ.ðəm/) : Thuật toán - Tập hợp chỉ dẫn giải quyết bài toán.
2. Database (/ˈdeɪ.tə.beɪs/) : Cơ sở dữ liệu - Hệ thống lưu trữ và quản lý dữ liệu.
3. Neural (/ˈnjʊə.rəl/) : Thuộc về nơ-ron - Mạng nơ-ron nhân tạo AI.
4. Framework (/ˈfreɪm.wɜːk/) : Khung phần mềm - Nền tảng xây dựng ứng dụng.
5. Compiler (/kəmˈpaɪ.lər/) : Trình biên dịch - Chương trình dịch mã nguồn.
6. Vector (/ˈvek.tər/) : Véc-tơ toán học - Mảng số nhiều chiều dùng trong Machine Learning.`;
              setCustomText(eng);
              setExtractedDoc({
                filename: 'tu_vung_tieng_anh_ai.txt',
                file_type: 'txt',
                char_count: eng.length,
                raw_text: eng,
                preview_snippet: 'Algorithm (/ˈæl.ɡə.rɪ.ðəm/) : Thuật toán...'
              });
              setVlmPackage(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 text-purple-300 text-xs font-bold transition shadow-sm"
          >
            🇬🇧 Tiếng Anh AI & Tech
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

      {/* VLM STANDARDIZED VOCABULARY TABLE (Kết quả phân tách về 1 format cố định) */}
      {vlmPackage && (
        <div className="bg-[#121c2e] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white flex flex-wrap items-center gap-2">
                  <span>VLM Đã Chuẩn Hóa Cố Định Thành Công!</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    {vlmPackage.vocabulary_deck.items.length} từ vựng • {vlmPackage.quiz_deck.items.length} câu trắc nghiệm
                  </span>
                  {vlmStatus && (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[11px] font-mono border border-cyan-500/30">
                      {vlmStatus}
                    </span>
                  )}
                </h4>
                <p className="text-xs text-gray-400">
                  {vlmPackage.title} • Sẵn sàng cho Game Bắn Gà, Magic Touch và Quiz Arena
                </p>
              </div>
            </div>

            {/* Launch Game Button */}
            <button
              onClick={() => onPackageGenerated(vlmPackage)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Chơi Game Ngay Với Bộ Từ Này</span>
            </button>
          </div>

          {/* Vocabulary Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#0B0F19]">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#161F30] text-gray-400 uppercase font-semibold text-[11px] border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Từ Vựng Gốc</th>
                  <th className="py-3 px-4">Phiên Âm (Pinyin/IPA)</th>
                  <th className="py-3 px-4">Chữ Cứng (Game Granny)</th>
                  <th className="py-3 px-4">Gõ Phím (Game Bắn Gà)</th>
                  <th className="py-3 px-4">Nghĩa Tiếng Việt</th>
                  <th className="py-3 px-4">Cử Chỉ Nét Vẽ</th>
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
          <span>Chỉ thị AI (Tùy chọn):</span>
        </div>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Nhập câu lệnh hướng dẫn AI (vd: 'Ưu tiên bóc tách từ vựng tiếng Trung HSK, nhận diện từng chữ cứng và Pinyin, bỏ qua tiếng Anh')..."
          className="flex-1 bg-[#0b0f19] border border-gray-700 focus:border-cyan-400 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition"
        />
        {customPrompt && (
          <button
            type="button"
            onClick={() => setCustomPrompt('')}
            className="text-gray-400 hover:text-white text-xs px-2 py-1"
          >
            Xóa
          </button>
        )}
      </div>

      {/* Direct Text / Editor Area */}
      <div className="bg-[#161F30] border border-gray-800 rounded-3xl p-6 shadow-xl">

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-white text-base">Văn Bản Nguồn Hoặc Dán Trực Tiếp Vào VLM</h4>
          </div>
          {extractedDoc && (
            <span className="text-xs text-gray-400 bg-[#0B0F19] px-3 py-1 rounded-lg border border-gray-800">
              {extractedDoc.filename} ({extractedDoc.char_count} ký tự)
            </span>
          )}
        </div>

        <textarea
          rows={6}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Dán bất kỳ bài học nào tại đây, kể cả chữ dính chùm hoặc lộn xộn... VLM sẽ tự phân tách và chuẩn hóa!"
          className="w-full bg-[#0B0F19] border border-gray-700 focus:border-cyan-400 rounded-2xl p-4 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-y transition font-mono leading-relaxed"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            💡 VLM sẽ tự động phân tách chữ Hán/Anh, nhận diện phiên âm Pinyin/IPA, làm sạch nghĩa tiếng Việt và gán cử chỉ nét vẽ.
          </p>

          <button
            onClick={handleGenerateAI}
            disabled={isGenerating || !customText.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-2xl text-sm transition shadow-lg shadow-purple-500/25 cursor-pointer disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>VLM Đang Khử Nhiễu & Tạo Cấu Trúc...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Kích Hoạt VLM Phân Tách & Tạo Game</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
