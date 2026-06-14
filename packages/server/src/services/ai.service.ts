import OpenAI from 'openai';
import { env } from '../config/env';
import type { WeaknessItem, StrengthItem, RecommendationItem } from '@learning/shared';

export interface AnalysisResult {
  summary: string;
  score_trend: 'improving' | 'stable' | 'declining';
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
  recommendations: RecommendationItem[];
  encouragement: string;
}

const SYSTEM_PROMPT = `你是一位经验丰富的小学教育分析师，擅长根据学生的学习数据生成学情分析报告。

你的任务：
1. 分析学生的学习数据（成绩、错题、老师反馈、作业记录）
2. 识别优势知识点和薄弱知识点
3. 给出针对性的学习建议
4. 给学生写一句鼓励的话

要求：
- 严格基于提供的数据进行分析，不要臆测
- 薄弱知识点按照严重程度分类：mild（轻微）、moderate（中等）、severe（严重）
- 建议要具体可操作，包含具体的科目和行动
- 使用JSON格式返回，不要添加其他内容
- 所有字段必须存在，不能为空数组时至少返回一个元素`;

function buildPrompt(data: {
  studentName: string;
  grade: number;
  records: any[];
  homeworkLogs: any[];
}): string {
  const { studentName, grade, records, homeworkLogs } = data;

  let prompt = `## 学生信息\n`;
  prompt += `姓名：${studentName}\n`;
  prompt += `年级：一年级（${grade}年级）\n\n`;

  prompt += `## 学习记录\n`;
  if (records.length === 0) {
    prompt += '暂无学习记录。\n\n';
  } else {
    for (const r of records) {
      prompt += `- 类型：${r.type} | 科目：${r.subject_name || '未知'} | 标题：${r.title}\n`;
      if (r.score !== null) {
        prompt += `  成绩：${r.score}/${r.total_score}\n`;
      }
      if (r.teacher_feedback) {
        prompt += `  老师反馈：${r.teacher_feedback}\n`;
      }
      if (r.wrong_items) {
        try {
          const wrongs = typeof r.wrong_items === 'string' ? JSON.parse(r.wrong_items) : r.wrong_items;
          if (wrongs.length > 0) {
            prompt += `  错题：${wrongs.map((w: any) => w.description).join('；')}\n`;
          }
        } catch { /* ignore */ }
      }
      prompt += `  日期：${r.record_date}\n\n`;
    }
  }

  prompt += `## 作业记录\n`;
  if (homeworkLogs.length === 0) {
    prompt += '暂无作业记录。\n\n';
  } else {
    for (const h of homeworkLogs) {
      const statusMap: Record<string, string> = { completed: '已完成', partial: '部分完成', not_done: '未完成' };
      prompt += `- 科目ID：${h.subject_id} | 状态：${statusMap[h.status] || h.status} | 难度自评：${h.difficulty_rating}/5 | 日期：${h.date}\n`;
      if (h.notes) prompt += `  备注：${h.notes}\n`;
    }
  }

  prompt += `\n请根据以上数据生成分析报告，返回以下JSON格式：
{
  "summary": "整体学习状况描述（2-3句话）",
  "score_trend": "improving|stable|declining",
  "strengths": [{"knowledge_point": "知识点名称", "evidence": "具体证据"}],
  "weaknesses": [{"knowledge_point": "知识点名称", "severity": "mild|moderate|severe", "evidence": "具体证据", "suggestion": "改进建议"}],
  "recommendations": [{"priority": 1, "action": "具体行动", "subject": "科目", "duration_minutes": 建议时长(分钟)}],
  "encouragement": "给学生的鼓励语（亲切、正向、具体）"
}`;

  return prompt;
}

export class AIService {
  private client: OpenAI | null = null;

  constructor() {
    if (env.LLM_API_KEY && env.LLM_API_KEY !== 'sk-xxx') {
      this.client = new OpenAI({
        apiKey: env.LLM_API_KEY,
        baseURL: env.LLM_BASE_URL,
      });
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async analyze(data: {
    studentName: string;
    grade: number;
    records: any[];
    homeworkLogs: any[];
  }): Promise<AnalysisResult> {
    if (!this.isAvailable()) {
      return this.fallbackAnalysis(data);
    }

    const prompt = buildPrompt(data);

    try {
      const response = await this.client!.chat.completions.create({
        model: env.LLM_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from LLM');
      }

      const result = JSON.parse(content) as AnalysisResult;

      // Validate result structure
      if (!result.summary || !Array.isArray(result.weaknesses) || !Array.isArray(result.strengths)) {
        throw new Error('Invalid response structure');
      }

      return result;
    } catch (error) {
      console.error('LLM analysis failed, falling back to statistical analysis:', error);
      return this.fallbackAnalysis(data);
    }
  }

  // Fallback: basic statistical analysis without AI
  async fallbackAnalysis(data: {
    studentName: string;
    records: any[];
    homeworkLogs: any[];
  }): Promise<AnalysisResult> {
    const { studentName, records, homeworkLogs } = data;

    const scores = records.filter((r) => r.score !== null);
    const avgScore = scores.length > 0
      ? scores.reduce((sum, r) => sum + (parseFloat(r.score) / parseFloat(r.total_score) * 100), 0) / scores.length
      : 0;

    const completedHomework = homeworkLogs.filter((h) => h.status === 'completed').length;
    const totalHomework = homeworkLogs.length;

    // Extract weak knowledge points from wrong items
    const allWrongItems: string[] = [];
    for (const r of records) {
      if (r.wrong_items) {
        try {
          const wrongs = typeof r.wrong_items === 'string' ? JSON.parse(r.wrong_items) : r.wrong_items;
          for (const w of wrongs) {
            if (w.knowledge_point) allWrongItems.push(w.knowledge_point);
          }
        } catch { /* ignore */ }
      }
    }

    const weaknesses: WeaknessItem[] = allWrongItems.length > 0
      ? allWrongItems.map((item) => ({
          knowledge_point: item,
          severity: 'moderate' as const,
          evidence: '作业/考试中出现错误',
          suggestion: '建议多做相关练习题，巩固基础',
        }))
      : [];

    const trend: 'improving' | 'stable' | 'declining' = scores.length >= 2
      ? parseFloat(scores[scores.length - 1].score) / parseFloat(scores[scores.length - 1].total_score) >
        parseFloat(scores[0].score) / parseFloat(scores[0].total_score)
        ? 'improving'
        : 'declining'
      : 'stable';

    return {
      summary: `${studentName}同学近期完成了${records.length}条学习记录，${scores.length}次考试/测验，作业完成率${totalHomework > 0 ? Math.round((completedHomework / totalHomework) * 100) : 0}%。`,
      score_trend: trend,
      strengths: avgScore >= 85 ? [{ knowledge_point: '整体学习能力', evidence: `平均分${Math.round(avgScore)}%` }] : [],
      weaknesses,
      recommendations: [
        {
          priority: 1,
          action: weaknesses.length > 0 ? '针对薄弱知识点进行专项练习' : '保持当前学习节奏，适当拓展',
          subject: '综合',
          duration_minutes: 15,
        },
      ],
      encouragement: `${studentName}同学，每天进步一点点，你就是最棒的！`,
    };
  }
}

export const aiService = new AIService();
