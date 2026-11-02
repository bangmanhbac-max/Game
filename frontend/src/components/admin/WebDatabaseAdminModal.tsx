import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Table, 
  Trash2, 
  Search, 
  RefreshCw, 
  Play, 
  BookOpen, 
  Terminal, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { 
  fetchDbTables, 
  fetchTableData, 
  deleteTableRow, 
  executeSqlQuery, 
  DbAdminOverview
} from '../../lib/api';

interface WebDatabaseAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebDatabaseAdminModal: React.FC<WebDatabaseAdminModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'sql' | 'guide'>('tables');
  const [dbOverview, setDbOverview] = useState<DbAdminOverview | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [tableData, setTableData] = useState<{ columns: string[]; rows: any[]; total_rows: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOverview();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedTable && activeTab === 'tables') {
      loadTableRows(selectedTable);
    }
  }, [isOpen, selectedTable, activeTab]);

  const loadOverview = async () => {
    try {
      const data = await fetchDbTables();
      setDbOverview(data);
      if (data.tables.length > 0 && !selectedTable) {
        setSelectedTable(data.tables[0].table_name);
      }
    } catch {}
  };

  const loadTableRows = async (tName: string, querySearch?: string) => {
    setIsLoading(true);
    try {
      const res = await fetchTableData(tName, 50, 0, querySearch || undefined);
      setTableData(res);
    } catch {}
    finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bản ghi '${rowId}' khỏi bảng '${selectedTable}'?`)) return;
    try {
      await deleteTableRow(selectedTable, rowId);
      loadTableRows(selectedTable, searchQuery);
      loadOverview();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa');
    }
  };

  const handleRunSql = async () => {
    try {
      const res = await executeSqlQuery(sqlQuery);
      setSqlResult(res);
    } catch (err: unknown) {
      setSqlResult({ error: err instanceof Error ? err.message : 'Lỗi SQL' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0b101c] border-2 border-cyan-500/50 rounded-3xl max-w-5xl w-full h-[680px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="p-4 bg-[#11192b] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Trung Tâm Quản Trị Cơ Sở Dữ Liệu Web (SQLite 3)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                  {dbOverview?.total_tables || 10} Bảng Live
                </span>
              </h3>
              <p className="text-xs text-gray-400">Xem trực tiếp, truy vấn SQL và quản lý dữ liệu toàn hệ thống</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#070b14] p-1 rounded-xl border border-gray-800">
              <button
                onClick={() => setActiveTab('tables')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'tables' ? 'bg-cyan-500 text-slate-950' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5 inline mr-1" /> Duyệt Bảng
              </button>
              <button
                onClick={() => setActiveTab('sql')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'sql' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 inline mr-1" /> SQL Console
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'guide' ? 'bg-amber-500 text-slate-950' : 'text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 inline mr-1" /> Hướng Dẫn Dùng
              </button>
            </div>

            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Live Tables Explorer */}
        {activeTab === 'tables' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Tables List */}
            <div className="w-64 bg-[#080d17] border-r border-gray-800 p-3 overflow-y-auto space-y-1 shrink-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 block mb-2">
                Các Bảng Dữ Liệu
              </span>
              {dbOverview?.tables.map((t) => (
                <button
                  key={t.table_name}
                  onClick={() => setSelectedTable(t.table_name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition ${
                    selectedTable === t.table_name
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <span className="truncate">{t.table_name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#161F30] text-[10px] text-gray-300 font-bold shrink-0">
                    {t.row_count}
                  </span>
                </button>
              ))}
            </div>

            {/* Main Table Viewer */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1424]">
              {/* Search and Action Bar */}
              <div className="p-3 bg-[#10182b] border-b border-gray-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Bảng:</span>
                  <span className="text-sm font-mono font-bold text-cyan-300 bg-[#080d17] px-2.5 py-1 rounded-lg border border-cyan-500/30">
                    {selectedTable}
                  </span>
                  <span className="text-xs text-gray-400">({tableData?.total_rows || 0} bản ghi)</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadTableRows(selectedTable, searchQuery)}
                      placeholder="Tìm kiếm..."
                      className="bg-[#080d17] border border-gray-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <button
                    onClick={() => loadTableRows(selectedTable, searchQuery)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition"
                    title="Làm mới"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-auto p-4 text-xs font-mono">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-cyan-400 gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Đang tải dữ liệu bảng...</span>
                  </div>
                ) : !tableData || tableData.rows.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Bảng này hiện chưa có bản ghi nào.
                  </div>
                ) : (
                  <div className="border border-gray-800 rounded-2xl overflow-hidden bg-[#070b14]">
                    <table className="w-full text-left">
                      <thead className="bg-[#121a2d] text-gray-400 uppercase text-[10px] border-b border-gray-800">
                        <tr>
                          {tableData.columns.map((c) => (
                            <th key={c} className="py-2.5 px-3 whitespace-nowrap">{c}</th>
                          ))}
                          <th className="py-2.5 px-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {tableData.rows.map((row, idx) => {
                          const pk = row.id || row.package_id || row[tableData.columns[0]];
                          return (
                            <tr key={idx} className="hover:bg-cyan-500/5 text-gray-300">
                              {tableData.columns.map((col) => (
                                <td key={col} className="py-2 px-3 whitespace-nowrap max-w-[200px] truncate" title={String(row[col])}>
                                  {typeof row[col] === 'boolean' 
                                    ? (row[col] ? 'true' : 'false') 
                                    : (row[col] === null ? '<null>' : String(row[col]))
                                  }
                                </td>
                              ))}
                              <td className="py-2 px-3 text-right whitespace-nowrap">
                                <button
                                  onClick={() => handleDeleteRow(pk)}
                                  className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition"
                                  title="Xóa bản ghi này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SQL Console */}
        {activeTab === 'sql' && (
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden bg-[#090e1a]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-purple-400" /> Trình Soạn Thảo SQL (SELECT Read-Only)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSqlQuery('SELECT username, email, role FROM users;')}
                  className="px-2.5 py-1 rounded bg-white/5 text-[11px] text-cyan-300 hover:bg-white/10"
                >
                  Xem Users
                </button>
                <button
                  onClick={() => setSqlQuery('SELECT game_mode, score, accuracy FROM game_sessions ORDER BY score DESC;')}
                  className="px-2.5 py-1 rounded bg-white/5 text-[11px] text-purple-300 hover:bg-white/10"
                >
                  Xem Điểm Game
                </button>
                <button
                  onClick={() => setSqlQuery('SELECT filename, file_type, char_count FROM uploaded_documents;')}
                  className="px-2.5 py-1 rounded bg-white/5 text-[11px] text-amber-300 hover:bg-white/10"
                >
                  Xem File Đã Tải
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <textarea
                rows={3}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="flex-1 bg-[#121a2d] border border-gray-700 rounded-xl p-3 font-mono text-xs text-white focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={handleRunSql}
                className="px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" /> Chạy
              </button>
            </div>

            {/* SQL Results */}
            <div className="flex-1 bg-[#050811] border border-gray-800 rounded-2xl p-4 overflow-auto font-mono text-xs">
              {sqlResult?.error ? (
                <div className="text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{sqlResult.error}</span>
                </div>
              ) : sqlResult?.rows ? (
                <div>
                  <span className="text-emerald-400 font-bold block mb-2">
                    ✓ Thực thi thành công ({sqlResult.row_count} kết quả):
                  </span>
                  <pre className="text-gray-300 leading-relaxed overflow-x-auto">
                    {JSON.stringify(sqlResult.rows, null, 2)}
                  </pre>
                </div>
              ) : (
                <span className="text-gray-500">Nhập câu lệnh SELECT và nhấn Chạy để xem kết quả.</span>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Detailed Guidance on Database Management */}
        {activeTab === 'guide' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-gray-300 bg-[#090e1a]">
            <div className="bg-[#121c2e] p-5 rounded-2xl border border-cyan-500/30 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Vị Trí File Cơ Sở Dữ Liệu Trên Máy Bạn
              </h4>
              <p>File database SQLite của toàn bộ dự án nằm tại:</p>
              <code className="block bg-[#070b14] p-3 rounded-xl border border-gray-800 font-mono text-cyan-300 text-xs">
                M:\Game\backend\eduplay.db
              </code>
            </div>

            {/* 4 Methods Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#101828] p-4 rounded-2xl border border-gray-800 space-y-2">
                <h5 className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px]">1</span>
                  Quản Trị Ngay Trên Web (Tiện Nhất)
                </h5>
                <p className="text-gray-400 leading-relaxed">
                  Ngay tại modal này (Tab <strong>Duyệt Bảng</strong> và <strong>SQL Console</strong>), bạn có thể xem tất cả 10 bảng, tìm kiếm từ vựng, điểm số game, tài khoản và xóa bản ghi tức thì không cần cài thêm bất kỳ app nào!
                </p>
              </div>

              <div className="bg-[#101828] p-4 rounded-2xl border border-gray-800 space-y-2">
                <h5 className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px]">2</span>
                  Dùng Extension "SQLite Viewer" (VS Code)
                </h5>
                <p className="text-gray-400 leading-relaxed">
                  Trong trình soạn thảo VS Code / Cursor: Vào mục Extensions cài đặt <strong>"SQLite Viewer"</strong> của Florian Klampfer. Sau đó chỉ cần nhấp đúp chuột vào file <code>eduplay.db</code> là xem bảng biểu cực đẹp!
                </p>
              </div>

              <div className="bg-[#101828] p-4 rounded-2xl border border-gray-800 space-y-2">
                <h5 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">3</span>
                  Dùng DB Browser for SQLite (Phần mềm máy tính)
                </h5>
                <p className="text-gray-400 leading-relaxed">
                  Tải miễn phí phần mềm chuyên dụng <strong>DB Browser for SQLite</strong> (sqlitebrowser.org). Mở file <code>eduplay.db</code> để chỉnh sửa, thêm cột, nhập/xuất file Excel CSV dễ dàng.
                </p>
              </div>

              <div className="bg-[#101828] p-4 rounded-2xl border border-gray-800 space-y-2">
                <h5 className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">4</span>
                  Dùng DBeaver hoặc Adminer Web UI
                </h5>
                <p className="text-gray-400 leading-relaxed">
                  Dành cho lập trình viên quản lý nhiều database cùng lúc. Kết nối JDBC SQLite cực nhanh, hỗ trợ sinh biểu đồ quan hệ Entity Relationship Diagram (ERD).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
