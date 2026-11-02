import { LearningPackage } from '../types/learning_content';
import { User, LoginCredentials, RegisterData, AuthResponse, LeaderboardItem, GameRecordData } from '../types/auth';

const API_BASE = '/api/v1';

export interface DocumentExtractResult {
  filename: string;
  file_type: string;
  char_count: number;
  raw_text: string;
  preview_snippet: string;
  learning_package?: LearningPackage;
  vlm_status?: string;
}

function getAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const activeToken = token || localStorage.getItem('eduplay_token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
}

// ================= AUTHENTICATION APIS =================

export async function loginUser(creds: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creds),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Đăng nhập thất bại' }));
    throw new Error(errorData.detail || 'Đăng nhập thất bại');
  }

  return res.json();
}

export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Đăng ký thất bại' }));
    throw new Error(errorData.detail || 'Đăng ký thất bại');
  }

  return res.json();
}

export async function getCurrentUser(token?: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    throw new Error('Phiên đăng nhập đã hết hạn');
  }

  return res.json();
}

export async function updateProfile(data: { full_name?: string; avatar?: string }): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Không thể cập nhật hồ sơ' }));
    throw new Error(errorData.detail || 'Lỗi cập nhật');
  }

  return res.json();
}

// ================= DOCUMENT & AI GENERATOR APIS =================

export async function uploadDocument(file: File, geminiApiKey?: string, customPrompt?: string): Promise<DocumentExtractResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (customPrompt) {
    formData.append('custom_prompt', customPrompt);
  }

  const activeToken = localStorage.getItem('eduplay_token');
  const headers: Record<string, string> = {};
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  const key = geminiApiKey || localStorage.getItem('gemini_api_key');
  if (key) {
    headers['X-Gemini-Key'] = key;
  }

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Lỗi tải file lên máy chủ' }));
    throw new Error(errorData.detail || 'Lỗi tải file');
  }

  return res.json();
}

export async function generateLearningContent(rawText: string, filename?: string, apiKey?: string, customPrompt?: string): Promise<LearningPackage> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      raw_text: rawText,
      filename,
      api_key: apiKey || undefined,
      custom_prompt: customPrompt || undefined,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Lỗi khi AI tạo sinh nội dung' }));
    throw new Error(errorData.detail || 'Lỗi AI');
  }

  return res.json();
}

// ================= DECKS APIS =================

export async function fetchDecks(): Promise<LearningPackage[]> {
  const res = await fetch(`${API_BASE}/decks`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể tải danh sách bài học');
  }
  return res.json();
}

export async function saveCustomDeck(pkg: LearningPackage): Promise<LearningPackage> {
  const res = await fetch(`${API_BASE}/decks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(pkg),
  });
  if (!res.ok) {
    throw new Error('Không thể lưu bài học vào cơ sở dữ liệu');
  }
  return res.json();
}

// ================= DOCUMENTS MANAGEMENT APIS =================

export interface UploadedDocRecord {
  id: string;
  filename: string;
  file_type: string;
  char_count: number;
  custom_prompt?: string;
  vlm_mode: string;
  package_id?: string;
  package_title?: string;
  created_at?: string;
}

export async function fetchUploadedDocuments(): Promise<UploadedDocRecord[]> {
  const res = await fetch(`${API_BASE}/documents`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể tải danh sách tài liệu');
  }
  return res.json();
}

export async function deleteUploadedDocument(docId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/${docId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể xóa tài liệu');
  }
}

// ================= CHAT & COPILOT APIS =================

export interface ChatMessage {
  id: string;
  channel: string;
  role: string;
  sender_name: string;
  sender_avatar: string;
  content: string;
  created_at?: string;
}

export async function fetchChatMessages(channel = 'world_chat'): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/chat/messages?channel=${channel}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể tải lịch sử trò chuyện');
  }
  return res.json();
}

export async function sendChatMessage(
  content: string, 
  channel = 'world_chat',
  senderName = 'Người học',
  senderAvatar = 'iron-man',
  geminiKey?: string
): Promise<{ user_message: ChatMessage; ai_reply?: ChatMessage }> {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  };
  const key = geminiKey || localStorage.getItem('gemini_api_key');
  if (key) {
    headers['X-Gemini-Key'] = key;
  }

  const res = await fetch(`${API_BASE}/chat/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      channel,
      content,
      sender_name: senderName,
      sender_avatar: senderAvatar,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Lỗi gửi tin nhắn' }));
    throw new Error(errorData.detail || 'Lỗi gửi tin nhắn');
  }

  return res.json();
}

// ================= COMMUNITY & FRIENDS APIS =================

export interface CommunityFriend {
  id: string;
  username: string;
  full_name: string;
  avatar: string;
  role: string;
  status: string;
  is_friend: boolean;
}

export async function fetchCommunityFriends(): Promise<CommunityFriend[]> {
  const res = await fetch(`${API_BASE}/community/friends`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể tải danh sách cộng đồng');
  }
  return res.json();
}

export async function sendFriendRequest(friendUsername: string): Promise<any> {
  const res = await fetch(`${API_BASE}/community/friends/request`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ friend_username: friendUsername }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Không thể gửi kết bạn' }));
    throw new Error(err.detail || 'Không thể gửi kết bạn');
  }
  return res.json();
}

// ================= CONTACT & SUPPORT APIS =================

export async function submitContactForm(data: { name: string; email: string; subject: string; message: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Không thể gửi liên hệ' }));
    throw new Error(err.detail || 'Không thể gửi liên hệ');
  }
  return res.json();
}

// ================= WEB DATABASE ADMIN APIS =================

export interface DbTableSummary {
  table_name: string;
  row_count: number;
  columns: Array<{ name: string; type: string }>;
}

export interface DbAdminOverview {
  database_type: string;
  total_tables: number;
  tables: DbTableSummary[];
}

export async function fetchDbTables(): Promise<DbAdminOverview> {
  const res = await fetch(`${API_BASE}/admin/db/tables`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể tải danh sách bảng cơ sở dữ liệu');
  }
  return res.json();
}

export async function fetchTableData(tableName: string, limit = 50, offset = 0, search?: string): Promise<any> {
  let url = `${API_BASE}/admin/db/table/${tableName}?limit=${limit}&offset=${offset}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Không thể tải dữ liệu bảng ${tableName}`);
  }
  return res.json();
}

export async function deleteTableRow(tableName: string, rowId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/db/table/${tableName}/${rowId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể xóa bản ghi');
  }
  return res.json();
}

export async function executeSqlQuery(query: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/db/query`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Lỗi thực thi SQL' }));
    throw new Error(err.detail || 'Lỗi thực thi SQL');
  }
  return res.json();
}

// ================= GAME RECORDS & LEADERBOARD =================

export async function recordGameSession(data: GameRecordData): Promise<void> {
  try {
    await fetch(`${API_BASE}/games/record`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  } catch {
    // Không chặn game nếu mạng gián đoạn
  }
}

export async function fetchLeaderboard(gameMode?: string): Promise<LeaderboardItem[]> {
  const url = gameMode 
    ? `${API_BASE}/games/leaderboard?game_mode=${gameMode}` 
    : `${API_BASE}/games/leaderboard`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Không thể tải Bảng Xếp Hạng');
  }
  return res.json();
}

