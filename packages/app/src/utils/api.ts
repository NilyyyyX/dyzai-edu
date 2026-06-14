import { storage } from './storage'
import type { User, Student, LearningRecord, HomeworkLog, AnalysisReport, WeaknessRecord } from '@learning/shared'

const BASE_URL = '/api'

// Custom error class
export class ApiError extends Error {
  statusCode: number
  
  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

// Extended types
export interface WeaknessWithDetails extends WeaknessRecord {
  knowledge_point_name: string
  parent_id: string | null
  subject_name: string
}

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {} } = options

  const token = storage.get<string>('token')
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...header,
      } as Record<string, string>,
      body: method !== 'GET' ? JSON.stringify(data) : undefined,
    })

    if (response.status >= 200 && response.status < 300) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json() as T
      }
      return {} as T
    }

    if (response.status === 401) {
      storage.remove('token')
      storage.remove('user')
      window.location.href = '/login'
      throw new ApiError(401, '请先登录')
    }

    if (response.status === 429) {
      const errorData = await response.json() as { error?: string; existing?: any }
      throw new ApiError(429, errorData?.error || '请求过于频繁，请稍后再试')
    }

    const errorData = await response.json() as { error?: string }
    throw new ApiError(response.status, errorData?.error || `请求失败 (${response.status})`)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, '网络错误，请检查连接')
  }
}

// API Response Types
interface AuthResponse {
  token: string
  user: User
}

interface RegisterStudentResponse {
  token: string
  user: User
  student: Student
}

interface StudentProfileResponse {
  student: Student
  today_homework: HomeworkLog[]
  weakness_count: number
  points: number
}

export const api = {
  // Auth
  login: (data: { phone: string; password: string }) =>
    request<AuthResponse>({ url: '/auth/login', method: 'POST', data }),
    
  register: (data: { phone: string; password: string; nickname?: string }) =>
    request<AuthResponse>({ url: '/auth/register', method: 'POST', data }),
    
  registerStudent: (data: { name: string; grade: number; school?: string }) =>
    request<RegisterStudentResponse>({ url: '/auth/register-student', method: 'POST', data }),
    
  me: () => request<User>({ url: '/auth/me' }),

  // Parent
  getStudents: () => request<Student[]>({ url: '/parent/students' }),
  
  createLearningRecord: (data: any) =>
    request<LearningRecord>({ url: '/parent/learning-records', method: 'POST', data }),
    
  getLearningRecords: (studentId: string) =>
    request<LearningRecord[]>({ url: `/parent/learning-records/${studentId}` }),
    
  getPendingHomework: (studentId: string) =>
    request<HomeworkLog[]>({ url: `/parent/homework/${studentId}/pending` }),
    
  confirmHomework: (logId: string) =>
    request<{ success: boolean }>({ url: `/parent/homework/${logId}/confirm`, method: 'PUT' }),

  // Student
  getProfile: () => request<StudentProfileResponse>({ url: '/student/profile' }),
  
  createHomeworkLog: (data: any) =>
    request<HomeworkLog>({ url: '/student/homework', method: 'POST', data }),
    
  getWeaknesses: () => request<WeaknessWithDetails[]>({ url: '/student/weaknesses' }),
  
  getLatestAnalysis: () => request<AnalysisReport | null>({ url: '/student/analysis/latest' }),

  // Analysis
  triggerAnalysis: (studentId: string, data?: any) =>
    request<AnalysisReport>({ url: `/analysis/${studentId}/generate`, method: 'POST', data }),
    
  getLatestReport: (studentId: string) =>
    request<AnalysisReport | null>({ url: `/analysis/${studentId}` }),
    
  getReportHistory: (studentId: string) =>
    request<AnalysisReport[]>({ url: `/analysis/${studentId}/history` }),
    
  getScoreTrends: (studentId: string) =>
    request<Record<string, { scores: any[]; trend: string }>>({ url: `/analysis/${studentId}/trends` }),

  // Chat Analysis
  analyzeChatRecord: (data: { chat_text: string }) =>
    request<{
      knowledge_points: string[]
      weaknesses: string[]
      summary: string
      recommendations: string[]
    }>({ url: '/chat-analysis/analyze', method: 'POST', data }),

  saveWeaknesses: (data: { weaknesses: string[]; knowledge_points: string[] }) =>
    request<{ success: boolean; saved_count: number }>({ url: '/chat-analysis/save-weaknesses', method: 'POST', data }),

  // Public
  getSubjects: () => request<Array<{ id: number; name: string; code: string }>>({ url: '/subjects' }),
  
  getKnowledgePoints: (subjectId: string) =>
    request<any[]>({ url: `/knowledge-points/${subjectId}` }),
}
