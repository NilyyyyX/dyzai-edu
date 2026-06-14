import { z } from 'zod';

export const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  nickname: z.string().max(50).optional(),
});

export const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

export const studentSchema = z.object({
  name: z.string().min(1).max(50),
  grade: z.number().int().min(1).max(6),
  school: z.string().max(100).optional(),
});

export const learningRecordSchema = z.object({
  student_id: z.number().int(),
  subject_id: z.number().int(),
  type: z.enum(['exam', 'quiz', 'homework', 'feedback']),
  title: z.string().max(200),
  score: z.number().optional(),
  total_score: z.number().optional(),
  teacher_feedback: z.string().optional(),
  wrong_items: z.array(z.object({
    description: z.string(),
    knowledge_point: z.string().optional(),
    correct_answer: z.string().optional(),
  })).optional(),
  record_date: z.string(),
});

export const homeworkLogSchema = z.object({
  subject_id: z.number().int(),
  status: z.enum(['completed', 'partial', 'not_done']),
  difficulty_rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
});
