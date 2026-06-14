import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

// Database schema types
export interface User {
  id: number;
  phone: string;
  password_hash: string;
  role: 'parent' | 'student';
  nickname: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  user_id: number;
  parent_id: number;
  name: string;
  grade: number;
  school?: string | null;
  created_at: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface KnowledgePoint {
  id: string;
  subject_id: number;
  parent_id?: string | null;
  name: string;
  level: number;
  sort_order: number;
}

export interface LearningRecord {
  id: number;
  student_id: number;
  subject_id: number;
  type: 'exam' | 'quiz' | 'homework' | 'feedback';
  title: string;
  score?: number | null;
  total_score?: number | null;
  teacher_feedback?: string | null;
  wrong_items?: any[] | null;
  image_urls?: string[] | null;
  record_date: string;
  created_at: string;
}

export interface HomeworkLog {
  id: number;
  student_id: number;
  subject_id: number;
  date: string;
  status: 'completed' | 'partial' | 'not_done';
  difficulty_rating: number;
  notes?: string | null;
  parent_confirmed: boolean;
  confirmed_at?: string | null;
  created_at: string;
}

export interface AnalysisReport {
  id: number;
  student_id: number;
  report_type: 'weekly' | 'monthly' | 'subject';
  subject_id?: number | null;
  summary?: string | null;
  strengths?: any[] | null;
  weaknesses?: any[] | null;
  recommendations?: any[] | null;
  trend_data?: any | null;
  generated_at: string;
}

export interface WeaknessRecord {
  id: number;
  student_id: number;
  knowledge_point_id: string;
  severity: 'mild' | 'moderate' | 'severe';
  detected_at: string;
  resolved_at?: string | null;
  source: 'exam' | 'practice' | 'ai_analysis';
}

export interface PointsLedger {
  id: number;
  student_id: number;
  amount: number;
  reason: string;
  reference_type?: string | null;
  reference_id?: number | null;
  created_at: string;
}

export interface StickerInventory {
  id: number;
  student_id: number;
  sticker_type: string;
  acquired_at: string;
  equipped: boolean;
}

export interface ChatMessage {
  id: number;
  from_user: string;
  content: string;
  analysis_result: string;
  received_at: string;
}

export interface DatabaseSchema {
  users: User[];
  students: Student[];
  subjects: Subject[];
  knowledge_points: KnowledgePoint[];
  learning_records: LearningRecord[];
  homework_logs: HomeworkLog[];
  analysis_reports: AnalysisReport[];
  weakness_records: WeaknessRecord[];
  points_ledger: PointsLedger[];
  sticker_inventory: StickerInventory[];
  chat_messages: ChatMessage[];
}

let dbInstance: ReturnType<typeof JSONFilePreset<DatabaseSchema>> | null = null;

function getDefaultData(): DatabaseSchema {
  return {
    users: [],
    students: [],
    subjects: [],
    knowledge_points: [],
    learning_records: [],
    homework_logs: [],
    analysis_reports: [],
    weakness_records: [],
    points_ledger: [],
    sticker_inventory: [],
    chat_messages: [],
  };
}

export async function getDb() {
  if (!dbInstance) {
    const dbPath = process.env.DB_PATH || './db/dev.sqlite3.json';
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbInstance = await JSONFilePreset<DatabaseSchema>(dbPath, getDefaultData());
  }
  return dbInstance;
}

export async function resetDb() {
  dbInstance = null;
  const dbPath = process.env.DB_PATH || './db/dev.sqlite3.json';
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  await getDb();
}

// Auto-increment helper
function nextId(collection: any[]): number {
  return collection.length > 0 ? Math.max(...collection.map((i: any) => i.id)) + 1 : 1;
}
