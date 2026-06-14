import { Request, Response } from 'express';
import OpenAI from 'openai';
import { env } from '../config/env';
import { getDb } from '../db/database';

// Reuse OpenAI client config from ai.service
let client: OpenAI | null = null;
if (env.LLM_API_KEY && env.LLM_API_KEY !== 'sk-xxx') {
  client = new OpenAI({
    apiKey: env.LLM_API_KEY,
    baseURL: env.LLM_BASE_URL,
  });
}

const CHAT_ANALYSIS_PROMPT = `你是一位专业的小学教育分析师，擅长从家教与家长的聊天记录中提取学生的学习情况。

你的任务：
1. 从聊天记录中提取涉及的学科知识点
2. 识别学生的薄弱项（做错的、不会的、需要加强的）
3. 生成简洁的分析总结
4. 给出针对性的学习建议

要求：
- 严格基于聊天内容分析，不要臆测
- 知识点要具体（如"分数加减法"而不是"数学"）
- 薄弱项要明确描述问题
- 建议要具体可操作
- 使用JSON格式返回，不要添加其他内容

返回格式：
{
  "knowledge_points": ["知识点1", "知识点2", ...],
  "weaknesses": ["薄弱项1", "薄弱项2", ...],
  "summary": "整体分析总结（2-3句话）",
  "recommendations": ["建议1", "建议2", ...]
}`;

function buildChatPrompt(chatText: string): string {
  return `以下是家教发送的学习情况聊天记录，请分析其中的知识点和薄弱项：\n\n---\n${chatText}\n---\n\n请分析并返回JSON格式结果。`;
}

// Fallback analysis without AI
function fallbackChatAnalysis(chatText: string) {
  // Topic keywords (independent of subject name)
  const topicKeywords = [
    '加减法', '乘除法', '分数', '小数', '应用题', '几何', '面积', '周长', '通分', '约分',
    '阅读理解', '作文', '生字', '拼音', '古诗', '文言文', '笔画', '偏旁', '造句',
    '单词', '语法', '听力', '口语', '拼写', '听写', '句型',
  ];

  const knowledgePoints: string[] = [];
  const weaknesses: string[] = [];

  // Extract found topics
  for (const topic of topicKeywords) {
    if (chatText.includes(topic)) {
      knowledgePoints.push(topic);
    }
  }

  // Look for error indicators and extract context
  const errorPatterns = ['错', '不会', '不懂', '需要加强', '薄弱', '失分', '扣分', '不熟', '不好'];
  const sentences = chatText.split(/[。！？\n]+/).filter(s => s.trim().length > 3);
  for (const sentence of sentences) {
    if (errorPatterns.some(p => sentence.includes(p))) {
      const trimmed = sentence.trim().slice(0, 60);
      if (trimmed.length > 5) weaknesses.push(trimmed);
    }
  }

  return {
    knowledge_points: knowledgePoints.length > 0 ? knowledgePoints : ['未能自动提取知识点，建议配置 AI Key 以获得更精准的分析'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['未发现明显薄弱项，建议持续关注'],
    summary: `分析了${chatText.length}字的聊天记录，提取了${knowledgePoints.length}个知识点和${weaknesses.length}个薄弱项。${knowledgePoints.length > 0 ? `涉及的知识点包括：${knowledgePoints.slice(0, 5).join('、')}。` : ''}`,
    recommendations: [
      weaknesses.length > 0 ? '针对上述薄弱项进行专项练习' : '保持当前学习节奏',
      '定期复习已学知识点，巩固基础',
      '与家教保持沟通，及时反馈学习情况',
    ],
  };
}

export async function analyzeChat(req: Request, res: Response) {
  const { chat_text } = req.body;

  if (!chat_text || typeof chat_text !== 'string' || chat_text.trim().length < 50) {
    res.status(400).json({ error: '聊天记录太短，请提供至少50字的内容' });
    return;
  }

  try {
    let result;

    if (client) {
      const response = await client.chat.completions.create({
        model: env.LLM_MODEL,
        messages: [
          { role: 'system', content: CHAT_ANALYSIS_PROMPT },
          { role: 'user', content: buildChatPrompt(chat_text) },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Empty LLM response');

      result = JSON.parse(content);

      // Validate structure
      if (!Array.isArray(result.knowledge_points) || !Array.isArray(result.weaknesses)) {
        throw new Error('Invalid response structure');
      }
    } else {
      // Fallback when no AI key configured
      result = fallbackChatAnalysis(chat_text);
    }

    res.json(result);
  } catch (error) {
    console.error('Chat analysis failed:', error);
    // Fallback on error
    res.json(fallbackChatAnalysis(chat_text));
  }
}

export async function saveWeaknesses(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;
  const { weaknesses, knowledge_points } = req.body;

  if (!Array.isArray(weaknesses) || !Array.isArray(knowledge_points)) {
    res.status(400).json({ error: 'Invalid data format' });
    return;
  }

  // Find the first student for this parent (demo mode)
  const student = db.data.students.find(s => s.parent_id === userId);
  if (!student) {
    res.status(404).json({ error: 'No student found' });
    return;
  }

  // Save each weakness as a record
  let savedCount = 0;
  const now = new Date().toISOString();

  for (const weaknessText of weaknesses) {
    // Try to find matching knowledge point
    const kp = db.data.knowledge_points.find(
      k => weaknessText.includes(k.name) || knowledge_points.some((kpText: string) => kpText.includes(k.name))
    );

    db.data.weakness_records.push({
      id: db.data.weakness_records.length > 0
        ? Math.max(...db.data.weakness_records.map(w => w.id)) + 1
        : 1,
      student_id: student.id,
      knowledge_point_id: kp?.id || 'unknown',
      severity: 'moderate',
      detected_at: now,
      resolved_at: null,
      source: 'ai_analysis',
    });
    savedCount++;
  }

  await db.write();
  res.json({ success: true, saved_count: savedCount });
}
