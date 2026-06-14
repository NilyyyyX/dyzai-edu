export type RecordType = 'exam' | 'quiz' | 'homework' | 'feedback';

export interface LearningRecord {
  id: number;
  student_id: number;
  subject_id: number;
  type: RecordType;
  title: string;
  score: number | null;
  total_score: number | null;
  teacher_feedback: string | null;
  wrong_items: WrongItem[] | null;
  image_urls: string[] | null;
  record_date: string;
  created_at: string;
}

export interface WrongItem {
  description: string;
  knowledge_point?: string;
  correct_answer?: string;
}

export interface CreateLearningRecordInput {
  student_id: number;
  subject_id: number;
  type: RecordType;
  title: string;
  score?: number;
  total_score?: number;
  teacher_feedback?: string;
  wrong_items?: WrongItem[];
  record_date: string;
}

export type ReportType = 'weekly' | 'monthly' | 'subject';

export interface AnalysisReport {
  id: number;
  student_id: number;
  report_type: ReportType;
  subject_id: number | null;
  summary: string;
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
  recommendations: RecommendationItem[];
  trend_data: TrendData | null;
  generated_at: string;
}

export interface StrengthItem {
  knowledge_point: string;
  evidence: string;
}

export interface WeaknessItem {
  knowledge_point: string;
  severity: 'mild' | 'moderate' | 'severe';
  evidence: string;
  suggestion: string;
}

export interface RecommendationItem {
  priority: number;
  action: string;
  subject: string;
  duration_minutes?: number;
}

export interface TrendData {
  scores: { date: string; score: number; total: number }[];
  trend: 'improving' | 'stable' | 'declining';
}

export type Severity = 'mild' | 'moderate' | 'severe';

export interface WeaknessRecord {
  id: number;
  student_id: number;
  knowledge_point_id: string;
  severity: Severity;
  detected_at: string;
  resolved_at: string | null;
  source: 'exam' | 'practice' | 'ai_analysis';
}

export interface HomeworkLog {
  id: number;
  student_id: number;
  subject_id: number;
  date: string;
  status: 'completed' | 'partial' | 'not_done';
  difficulty_rating: number;
  notes: string | null;
  parent_confirmed: boolean;
  confirmed_at: string | null;
  created_at: string;
}

export interface CreateHomeworkLogInput {
  subject_id: number;
  status: 'completed' | 'partial' | 'not_done';
  difficulty_rating?: number;
  notes?: string;
}
