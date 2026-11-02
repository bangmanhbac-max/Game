import React, { useState, useEffect } from 'react';
import { 
  X, 
  FolderArchive, 
  Trash2, 
  Search, 
  Calendar, 
  Cpu, 
  Loader2,
  FileCheck
} from 'lucide-react';
import { fetchUploadedDocuments, deleteUploadedDocument, UploadedDocRecord } from '../../lib/api';

interface DocumentsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDeck?: (deck: any) => void;
}

export const DocumentsManagerModal: React.FC<DocumentsManagerModalProps> = ({ isOpen, onClose }) => {
  const [documents, setDocuments] = useState<UploadedDocRecord[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDocs();
    }
  }, [isOpen]);

  const loadDocs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUploadedDocuments();
      setDocuments(data);
    } catch {}
    finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      await deleteUploadedDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {}
  };

  const filteredDocs = documents.filter((d) => 
    d.filename.toLowerCase().includes(search.toLowerCase()) ||
    (d.custom_prompt && d.custom_prompt.toLowerCase().includes(search.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0e1626] border-2 border-cyan-500/40 rounded-3xl max-w-3xl w-full h-[600px] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#141f33] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Kho Quản Lý File & Tài Liệu Từ Vựng</h3>
              <p className="text-xs text-gray-400">Xem và quản lý tất cả các tài liệu đã nạp vào mô hình VLM</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-[#0a101d] border-b border-gray-800 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tài liệu theo tên file hoặc prompt..."
              className="w-full bg-[#161F30] border border-gray-700 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition"
            />
          </div>
          <span className="text-xs text-gray-400 font-mono font-bold">
            {filteredDocs.length} tài liệu
          </span>
        </div>

        {/* List of Documents */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-cyan-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Đang tải danh sách tài liệu...</span>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <FileCheck className="w-12 h-12 text-gray-600" />
              <p>Chưa có file nào được lưu trong kho.</p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div 
                key={doc.id}
                className="bg-[#131b2c] border border-gray-800 hover:border-cyan-500/40 rounded-2xl p-4 transition shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-mono text-xs font-bold uppercase border border-blue-500/30">
                      {doc.file_type}
                    </span>
                    <h4 className="font-bold text-white text-sm">{doc.filename}</h4>
                  </div>

                  {doc.custom_prompt && (
                    <p className="text-xs text-amber-300/90 italic bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-gray-800">
                      💬 Prompt: "{doc.custom_prompt}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      {doc.vlm_mode}
                    </span>
                    <span>{doc.char_count} ký tự</span>
                    {doc.created_at && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 transition cursor-pointer"
                    title="Xóa tài liệu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
