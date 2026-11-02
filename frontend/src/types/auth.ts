export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar: string;
  role: string;
  created_at: string;
}

export interface LoginCredentials {
  username_or_email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  avatar?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LeaderboardItem {
  rank: number;
  username: string;
  full_name?: string;
  avatar: string;
  score: number;
  accuracy: number;
  game_mode: string;
  played_at: string;
}

export interface GameRecordData {
  package_id: string;
  game_mode: 'chicken-shooter' | 'magic-touch' | 'quiz-arena';
  score: number;
  streak: number;
  max_streak: number;
  accuracy: number;
  words_defeated: number;
}
