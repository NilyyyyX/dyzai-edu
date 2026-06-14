export interface User {
  id: number;
  phone: string;
  role: 'parent' | 'student';
  nickname: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  user_id: number;
  parent_id: number;
  name: string;
  grade: number;
  school?: string;
  created_at: string;
}

export interface RegisterInput {
  phone: string;
  password: string;
  nickname?: string;
}

export interface LoginInput {
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
