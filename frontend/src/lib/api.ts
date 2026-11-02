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

// ================= AUTHENTICATION APIS (WITH SMART CLOUD/OFFLINE FALLBACK) =================

interface LocalUserRecord {
  id: string;
  username: string;
  email: string;
  password?: string;
  full_name: string;
  avatar: string;
  role: string;
  total_score: number;
  games_played: number;
  created_at: string;
}

function getLocalUsers(): LocalUserRecord[] {
  try {
    const raw = localStorage.getItem('eduplay_local_users');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local users', e);
  }
  return [
    {
      id: 'demo-hero-1',
      username: 'avenger_hero',
      email: 'tony@stark.eduplay.ai',
      password: 'password123',
      full_name: 'Tony Stark (Iron Man)',
      avatar: 'iron-man',
      role: 'admin',
      total_score: 9999,
      games_played: 42,
      created_at: new Date().toISOString(),
    }
  ];
}

function saveLocalUsers(users: LocalUserRecord[]) {
  localStorage.setItem('eduplay_local_users', JSON.stringify(users));
}

export async function loginUser(creds: LoginCredentials): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Đăng nhập thất bại' }));
        throw new Error(errorData.detail || 'Đăng nhập thất bại');
      }
      const data = await res.json();
      localStorage.setItem('eduplay_current_user', JSON.stringify(data.user));
      return data;
    }
  } catch (err: any) {
    // If backend returned a clear business error, propagate it
    if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
      throw err;
    }
  }

  // Cloud/Offline Fallback for Vercel/Static Demo
  const users = getLocalUsers();
  const ident = creds.username_or_email.toLowerCase().trim();
  const found = users.find(u => (u.username.toLowerCase() === ident || u.email.toLowerCase() === ident));

  if (!found || (found.password && found.password !== creds.password)) {
    throw new Error('Tên đăng nhập, email hoặc mật khẩu không chính xác.');
  }

  const userObj: User = {
    id: found.id,
    username: found.username,
    email: found.email,
    full_name: found.full_name,
    avatar: found.avatar,
    role: found.role,
    created_at: found.created_at,
  };

  const token = 'jwt_token_local_' + found.id;
  localStorage.setItem('eduplay_current_user', JSON.stringify(userObj));
  return {
    access_token: token,
    token_type: 'bearer',
    user: userObj,
  };
}

export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Đăng ký thất bại' }));
        throw new Error(errorData.detail || 'Đăng ký thất bại');
      }
      const authRes = await res.json();
      localStorage.setItem('eduplay_current_user', JSON.stringify(authRes.user));
      return authRes;
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
      throw err;
    }
  }

  // Cloud/Offline Fallback for Vercel/Static Demo
  const users = getLocalUsers();
  const lowerUser = data.username.toLowerCase().trim();
  const lowerEmail = data.email.toLowerCase().trim();

  if (users.some(u => u.username.toLowerCase() === lowerUser)) {
    throw new Error('Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.');
  }
  if (users.some(u => u.email.toLowerCase() === lowerEmail)) {
    throw new Error('Địa chỉ Email này đã được đăng ký tài khoản.');
  }

  const newRecord: LocalUserRecord = {
    id: 'hero_' + Date.now(),
    username: lowerUser,
    email: lowerEmail,
    password: data.password,
    full_name: data.full_name || data.username,
    avatar: data.avatar || 'iron-man',
    role: 'user',
    total_score: 0,
    games_played: 0,
    created_at: new Date().toISOString(),
  };

  users.push(newRecord);
  saveLocalUsers(users);

  const userObj: User = {
    id: newRecord.id,
    username: newRecord.username,
    email: newRecord.email,
    full_name: newRecord.full_name,
    avatar: newRecord.avatar,
    role: newRecord.role,
    created_at: newRecord.created_at,
  };

  const token = 'jwt_token_local_' + newRecord.id;
  localStorage.setItem('eduplay_current_user', JSON.stringify(userObj));
  return {
    access_token: token,
    token_type: 'bearer',
    user: userObj,
  };
}

export async function getCurrentUser(token?: string): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(token),
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json') && res.ok) {
      const u = await res.json();
      localStorage.setItem('eduplay_current_user', JSON.stringify(u));
      return u;
    }
  } catch {
    // fallback
  }

  const cached = localStorage.getItem('eduplay_current_user');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  throw new Error('Phiên đăng nhập đã hết hạn');
}

export async function updateProfile(data: { full_name?: string; avatar?: string }): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json') && res.ok) {
      const u = await res.json();
      localStorage.setItem('eduplay_current_user', JSON.stringify(u));
      return u;
    }
  } catch {}

  const cached = localStorage.getItem('eduplay_current_user');
  if (cached) {
    const u: User = JSON.parse(cached);
    if (data.full_name) u.full_name = data.full_name;
    if (data.avatar) u.avatar = data.avatar;
    localStorage.setItem('eduplay_current_user', JSON.stringify(u));
    return u;
  }
  throw new Error('Lỗi cập nhật');
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
  try {
    const res = await fetch(`${API_BASE}/decks`, {
      headers: getAuthHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend decks unreachable, using client cached decks');
  }

  try {
    const localDecks = localStorage.getItem('eduplay_saved_decks');
    if (localDecks) return JSON.parse(localDecks);
  } catch {}
  return [];
}

export async function saveCustomDeck(pkg: LearningPackage): Promise<LearningPackage> {
  try {
    const res = await fetch(`${API_BASE}/decks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pkg),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend save decks unreachable, saving to localStorage');
  }

  try {
    const localDecks = JSON.parse(localStorage.getItem('eduplay_saved_decks') || '[]');
    localDecks.unshift(pkg);
    localStorage.setItem('eduplay_saved_decks', JSON.stringify(localDecks));
  } catch {}
  return pkg;
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
  try {
    const url = gameMode 
      ? `${API_BASE}/games/leaderboard?game_mode=${gameMode}` 
      : `${API_BASE}/games/leaderboard`;
    
    const res = await fetch(url);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend leaderboard unreachable, using mock leaderboard');
  }

  return [
    { rank: 1, username: 'tony_stark_3000', full_name: 'Tony Stark (Iron Man)', avatar: 'iron-man', score: 9850, accuracy: 99.2, game_mode: 'magic-touch', played_at: '2026-11-01' },
    { rank: 2, username: 'dr_strange_sanctum', full_name: 'Doctor Strange', avatar: 'doctor-strange', score: 9420, accuracy: 97.5, game_mode: 'quiz-arena', played_at: '2026-11-01' },
    { rank: 3, username: 'cap_steve', full_name: 'Steve Rogers', avatar: 'cap', score: 8900, accuracy: 95.0, game_mode: 'chicken-shooter', played_at: '2026-10-31' },
    { rank: 4, username: 'thor_asgard', full_name: 'Thor Odinson', avatar: 'thor', score: 8650, accuracy: 93.8, game_mode: 'granny-3d', played_at: '2026-10-30' },
  ];
}

