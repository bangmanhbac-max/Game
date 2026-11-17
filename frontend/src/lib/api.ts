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
        const errorData = await res.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(errorData.detail || 'Login failed');
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
    throw new Error('Incorrect username, email, or password.');
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
        const errorData = await res.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(errorData.detail || 'Registration failed');
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
    throw new Error('This username is already taken. Please choose another.');
  }
  if (users.some(u => u.email.toLowerCase() === lowerEmail)) {
    throw new Error('This email address is already registered.');
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

  throw new Error('Session has expired');
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
  throw new Error('Update failed');
}

// ================= DOCUMENT & AI GENERATOR APIS =================

const GESTURE_TYPES: Array<'horizontal' | 'vertical' | 'slash' | 'backslash' | 'v_shape' | 'caret' | 'circle' | 'lightning'> = [
  'horizontal', 'vertical', 'slash', 'backslash', 'v_shape', 'caret', 'circle', 'lightning'
];

function generateClientFallbackPackage(rawText: string, filename?: string): LearningPackage {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const items = [];
  const quizItems = [];

  let idx = 0;
  for (const line of lines.slice(0, 30)) {
    let word = '';
    let meaning = '';
    if (line.includes(':')) {
      const parts = line.split(':');
      word = parts[0].trim();
      meaning = parts.slice(1).join(':').trim();
    } else if (line.includes('-')) {
      const parts = line.split('-');
      word = parts[0].trim();
      meaning = parts.slice(1).join('-').trim();
    } else {
      const words = line.split(/\s+/);
      word = words[0] || 'Word';
      meaning = words.slice(1).join(' ') || 'Core concept';
    }

    if (!word) continue;
    const cleanType = word.toLowerCase().replace(/[^a-z0-9]/g, '') || 'word' + (idx + 1);
    const gesture = GESTURE_TYPES[idx % GESTURE_TYPES.length];

    items.push({
      id: `vocab_${Date.now()}_${idx}`,
      target_text: word,
      phonetic: word,
      type_target: cleanType,
      meaning: meaning || 'Core definition',
      difficulty: (idx % 3) + 1,
      stroke_gesture: gesture,
    });

    quizItems.push({
      id: `quiz_${Date.now()}_${idx}`,
      question: `What is the accurate meaning of "${word}" in this lesson?`,
      options: [
        `A. ${meaning || 'Fundamental concept'}`,
        'B. Distant peripheral term',
        'C. Contrasting incorrect definition',
        'D. Secondary contextual note'
      ],
      correct_index: 0,
      explanation: `"${word}" represents: ${meaning || 'Core lesson knowledge.'}`,
      points: 100
    });

    idx++;
    if (idx >= 15) break;
  }

  // Nếu không tách được dòng nào hợp lệ, sinh bài học mẫu chất lượng cao
  if (items.length === 0) {
    items.push(
      { id: 'v1', target_text: 'Artificial Intelligence', phonetic: 'AI', type_target: 'ai', meaning: 'Artificial Intelligence', difficulty: 1, stroke_gesture: 'circle' as const },
      { id: 'v2', target_text: 'Machine Learning', phonetic: 'ML', type_target: 'ml', meaning: 'Machine Learning', difficulty: 2, stroke_gesture: 'lightning' as const },
      { id: 'v3', target_text: 'Neural Network', phonetic: 'Neural Network', type_target: 'neural', meaning: 'Biological neural computation model', difficulty: 2, stroke_gesture: 'v_shape' as const }
    );
    quizItems.push(
      { id: 'q1', question: 'What is a core machine learning model in modern AI?', options: ['A. Neural Network', 'B. Loop While', 'C. CSS Box', 'D. HTML Tag'], correct_index: 0, explanation: 'Neural Networks are the foundation of deep learning.', points: 100 }
    );
  }

  const pkgTitle = filename ? `Lesson: ${filename.replace(/\.[^/.]+$/, '')}` : 'Custom Knowledge Deck';
  const pkg: LearningPackage = {
    package_id: `pkg_local_${Date.now()}`,
    title: pkgTitle,
    source_filename: filename || 'custom_document.txt',
    created_at: new Date().toISOString(),
    vocabulary_deck: {
      id: `deck_v_${Date.now()}`,
      title: `${pkgTitle} (Vocabulary)`, 
      description: 'Auto-generated and optimized for 3D gaming arenas',
      target_language: 'vi-VN',
      items,
    },
    quiz_deck: {
      id: `deck_q_${Date.now()}`,
      title: `${pkgTitle} (Speed Quiz)`, 
      description: 'Fast-reflex multiple choice questions',
      items: quizItems,
    }
  };

  try {
    const localDecks: LearningPackage[] = JSON.parse(localStorage.getItem('eduplay_saved_decks') || '[]');
    localDecks.unshift(pkg);
    localStorage.setItem('eduplay_saved_decks', JSON.stringify(localDecks));
  } catch {}

  return pkg;
}

export const sanitizeGeminiApiKey = (key?: string | null): string => {
  if (!key) return '';
  return key.trim().replace(/^["'`]|["'`]$/g, '').trim();
};

export const GEMINI_WORKING_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
];

export async function testGeminiApiKey(apiKey: string): Promise<{ success: boolean; model?: string; error?: string }> {
  const cleanKey = sanitizeGeminiApiKey(apiKey);
  if (!cleanKey) {
    return { success: false, error: 'API Key cannot be empty' };
  }

  let lastError = '';
  for (const model of GEMINI_WORKING_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });

      if (res.ok) {
        return { success: true, model };
      }

      const errJson = await res.json().catch(() => null);
      const msg = errJson?.error?.message || `HTTP ${res.status}`;
      lastError = msg;

      // If invalid key or permission denied, fail immediately
      if (res.status === 400 && (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid'))) {
        return { success: false, error: 'Invalid API Key. Please verify on Google AI Studio.' };
      }
    } catch (e: any) {
      lastError = e?.message || 'Network error connecting to Google Gemini';
    }
  }

  return { success: false, error: lastError || 'Unable to connect to available Gemini models.' };
}

export async function generateWithClientGemini(rawText: string, apiKey: string, filename?: string, customPrompt?: string): Promise<LearningPackage> {
  const cleanKey = sanitizeGeminiApiKey(apiKey);
  const systemPrompt = `You are EduPlay AI Copilot. Your task is to analyze the following educational material and generate a standardized JSON learning package containing vocabulary and quiz questions matching the schema below:
{
  "title": "Appropriate lesson title in English",
  "description": "Concise summary of lesson content in English",
  "vocabulary_deck": {
    "title": "Vocabulary Deck",
    "description": "List of core target vocabulary items",
    "target_language": "zh-CN",
    "items": [
      {
        "id": "vocab_1",
        "target_text": "target word (Chinese characters or English term)",
        "phonetic": "pinyin or IPA phonetic transcription",
        "type_target": "lowercase unaccented string or pinyin without accents for typing games",
        "meaning": "English definition and meaning",
        "difficulty": 1,
        "stroke_gesture": "horizontal",
        "characters": ["individual", "component", "chars"]
      }
    ]
  },
  "quiz_deck": {
    "title": "Speed Quiz Arena",
    "description": "Reflex multiple choice questions",
    "items": [
      {
        "id": "quiz_1",
        "question": "Question prompt in English?",
        "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
        "correct_index": 0,
        "explanation": "Detailed explanation in English",
        "points": 100
      }
    ]
  }
}
Important requirements:
- The stroke_gesture value for each vocabulary item MUST be one of: "horizontal", "vertical", "slash", "backslash", "v_shape", "caret", "circle", "lightning".
- Extract between 6 and 12 essential vocabulary items and 3 to 6 reflex quiz questions.
${customPrompt ? `Additional instructions: ${customPrompt}` : ''}
Document Source Content:\n${rawText.slice(0, 7000)}`;

  for (const model of GEMINI_WORKING_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          let cleanJson = jsonText.trim();
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.slice(7);
          } else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.slice(3);
          }
          if (cleanJson.endsWith('```')) {
            cleanJson = cleanJson.slice(0, -3);
          }
          cleanJson = cleanJson.trim();

          const parsed = JSON.parse(cleanJson);
          const pkgId = `pkg_gemini_${Date.now()}`;
          return {
            package_id: pkgId,
            title: parsed.title || filename || 'Gemini AI Lesson',
            source_filename: filename,
            created_at: new Date().toISOString(),
            vocabulary_deck: {
              id: `vocab_deck_${pkgId}`,
              title: parsed.vocabulary_deck?.title || 'Vocabulary Deck',
              description: parsed.vocabulary_deck?.description || `Auto-generated by Google Gemini (${model})`, 
              target_language: parsed.vocabulary_deck?.target_language || 'zh-CN',
              items: (parsed.vocabulary_deck?.items || []).map((it: any, idx: number) => ({
                id: it.id || `voc_${pkgId}_${idx + 1}`,
                target_text: it.target_text || '',
                phonetic: it.phonetic || '',
                type_target: it.type_target || (it.phonetic ? it.phonetic.replace(/[^a-zA-Z]/g, '').toLowerCase() : '') || it.target_text || '',
                meaning: it.meaning || '',
                example: it.example || '',
                difficulty: Number(it.difficulty) || 1,
                stroke_gesture: it.stroke_gesture || 'horizontal',
                characters: it.characters || (it.target_text ? it.target_text.split('') : []),
                stroke_count: it.stroke_count || 5
              }))
            },
            quiz_deck: {
              id: `quiz_deck_${pkgId}`,
              title: parsed.quiz_deck?.title || 'Quiz Arena',
              description: parsed.quiz_deck?.description || '',
              items: (parsed.quiz_deck?.items || []).map((q: any, idx: number) => ({
                id: q.id || `quiz_${pkgId}_${idx + 1}`,
                question: q.question || '',
                options: Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'],
                correct_index: typeof q.correct_index === 'number' ? q.correct_index : 0,
                explanation: q.explanation || '',
                points: Number(q.points) || 10
              }))
            }
          };
        }
      }
    } catch (e) {
      console.warn(`Direct Gemini call with model ${model} failed`, e);
    }
  }

  throw new Error('Unable to generate lesson via Gemini API directly.');
}

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

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Failed to upload file to server' }));
        throw new Error(errorData.detail || 'File upload error');
      }
      return await res.json();
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
      throw err;
    }
    console.warn('Backend upload unreachable, attempting client-side text extractor fallback');
  }

  // Client-side text extraction fallback when on Vercel/Static without backend
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (['txt', 'md', 'json', 'csv', 'log', 'text'].includes(ext) || file.type.includes('text')) {
    const rawText = await file.text();
    let pkg: LearningPackage;

    // Nếu người dùng có Gemini API Key, ưu tiên sinh nội dung trực tiếp bằng Gemini từ trình duyệt
    if (key) {
      try {
        pkg = await generateWithClientGemini(rawText, key, file.name, customPrompt);
        return {
          filename: file.name,
          file_type: ext,
          char_count: rawText.length,
          raw_text: rawText,
          preview_snippet: rawText.slice(0, 300) + (rawText.length > 300 ? '...' : ''),
          learning_package: pkg,
          vlm_status: 'Google Gemini Direct Client Active'
        };
      } catch (geminiErr) {
        console.warn('Gemini direct generation error, fallback to regex', geminiErr);
      }
    }

    pkg = generateClientFallbackPackage(rawText, file.name);
    return {
      filename: file.name,
      file_type: ext,
      char_count: rawText.length,
      raw_text: rawText,
      preview_snippet: rawText.slice(0, 300) + (rawText.length > 300 ? '...' : ''),
      learning_package: pkg,
      vlm_status: 'Client-side Extractor & Generator Active'
    };
  }

  throw new Error('Python Backend server is offline for binary files (' + ext.toUpperCase() + '). Please upload plain text files (.txt, .md) to generate lessons instantly!');
}

export async function generateLearningContent(rawText: string, filename?: string, apiKey?: string, customPrompt?: string): Promise<LearningPackage> {
  const activeKey = apiKey || localStorage.getItem('gemini_api_key') || undefined;

  // 1. Thử gọi backend FastAPI trước
  try {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        raw_text: rawText,
        filename,
        api_key: activeKey,
        custom_prompt: customPrompt || undefined,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'AI content generation error' }));
        throw new Error(errorData.detail || 'AI error');
      }
      return await res.json();
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
      throw err;
    }
    console.warn('Backend generate unreachable, checking client-side Gemini or regex fallback');
  }

  // 2. Nếu backend không phản hồi (ví dụ khi chạy trên Vercel), và người dùng CÓ Gemini API Key:
  // Gọi trực tiếp Google Gemini REST API từ trình duyệt
  if (activeKey) {
    try {
      return await generateWithClientGemini(rawText, activeKey, filename, customPrompt);
    } catch (clientGeminiErr) {
      console.warn('Client-side direct Gemini generation failed, falling back to local extractor', clientGeminiErr);
    }
  }

  // 3. Fallback phân tích nhanh tại client nếu không có API key hoặc Gemini bị lỗi
  return generateClientFallbackPackage(rawText, filename);
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

export async function deleteCustomDeck(packageId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/decks/${packageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) return true;
  } catch (e) {
    console.warn('Backend delete deck unreachable, removing from localStorage');
  }

  try {
    const localDecks: LearningPackage[] = JSON.parse(localStorage.getItem('eduplay_saved_decks') || '[]');
    const next = localDecks.filter(d => d.package_id !== packageId);
    localStorage.setItem('eduplay_saved_decks', JSON.stringify(next));
    return true;
  } catch {}
  return false;
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
    throw new Error('Unable to load documents');
  }
  return res.json();
}

export async function deleteUploadedDocument(docId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/${docId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Unable to delete document');
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
    throw new Error('Unable to load chat history');
  }
  return res.json();
}

export async function sendChatMessage(
  content: string, 
  channel = 'world_chat',
  senderName = 'Learner',
  senderAvatar = 'iron-man',
  geminiKey?: string
): Promise<{ user_message: ChatMessage; ai_reply?: ChatMessage }> {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  };
  const rawKey = geminiKey || localStorage.getItem('gemini_api_key');
  const cleanKey = sanitizeGeminiApiKey(rawKey);
  if (cleanKey) {
    headers['X-Gemini-Key'] = cleanKey;
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

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Server returned invalid format (offline/static mode)');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to send message' }));
    throw new Error(errorData.detail || 'Failed to send message');
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
    throw new Error('Unable to load community list');
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
    const err = await res.json().catch(() => ({ detail: 'Unable to send friend request' }));
    throw new Error(err.detail || 'Unable to send friend request');
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
    const err = await res.json().catch(() => ({ detail: 'Unable to submit feedback' }));
    throw new Error(err.detail || 'Unable to submit feedback');
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
    throw new Error('Unable to load database tables');
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
    throw new Error(`Unable to load data for table ${tableName}`);
  }
  return res.json();
}

export async function deleteTableRow(tableName: string, rowId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/db/table/${tableName}/${rowId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Unable to delete record');
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
    const err = await res.json().catch(() => ({ detail: 'SQL execution error' }));
    throw new Error(err.detail || 'SQL execution error');
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

