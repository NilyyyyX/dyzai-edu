export type ExerciseType = 'choice' | 'fill_blank' | 'true_false' | 'short_answer';

export interface Exercise {
  id: number;
  knowledge_point_id: string;
  type: ExerciseType;
  difficulty: number;
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  created_at: string;
}

export interface PracticeSession {
  id: number;
  student_id: number;
  knowledge_point_id: string;
  total_questions: number;
  correct_count: number;
  started_at: string;
  completed_at: string | null;
}

export interface PracticeAnswer {
  id: number;
  session_id: number;
  exercise_id: number;
  student_answer: string;
  is_correct: boolean;
  time_spent_sec: number;
}
