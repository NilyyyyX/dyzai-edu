import { Request, Response } from 'express';
import { generateAnalysis } from '../services/analysis.service';
import { getDb } from '../db/database';

export async function triggerAnalysis(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;
  const { studentId } = req.params;

  const student = db.data.students.find(
    s => s.id === parseInt(studentId) && s.parent_id === userId
  );
  if (!student) {
    res.status(403).json({ error: 'Student not found' });
    return;
  }

  const reportType = (req.body.report_type || 'weekly') as 'weekly' | 'monthly' | 'subject';
  const subjectId = req.body.subject_id ? parseInt(req.body.subject_id) : undefined;

  try {
    const result = await generateAnalysis({ studentId: student.id, reportType, subjectId });

    if (result.error) {
      res.status(429).json({ error: result.error, existing: result.existing });
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Analysis generation failed:', error);
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
}

export async function getLatestReport(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;
  const { studentId } = req.params;

  const student = db.data.students.find(
    s => s.id === parseInt(studentId) && s.parent_id === userId
  );
  if (!student) {
    res.status(403).json({ error: 'Student not found' });
    return;
  }

  const report = db.data.analysis_reports
    .filter(r => r.student_id === student.id)
    .sort((a, b) => b.generated_at.localeCompare(a.generated_at))[0];

  if (!report) {
    res.json(null);
    return;
  }

  res.json(report);
}

export async function getReportHistory(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;
  const { studentId } = req.params;

  const student = db.data.students.find(
    s => s.id === parseInt(studentId) && s.parent_id === userId
  );
  if (!student) {
    res.status(403).json({ error: 'Student not found' });
    return;
  }

  const reports = db.data.analysis_reports
    .filter(r => r.student_id === student.id)
    .sort((a, b) => b.generated_at.localeCompare(a.generated_at))
    .slice(0, 20);

  res.json(reports);
}

export async function getScoreTrends(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;
  const { studentId } = req.params;

  const student = db.data.students.find(
    s => s.id === parseInt(studentId) && s.parent_id === userId
  );
  if (!student) {
    res.status(403).json({ error: 'Student not found' });
    return;
  }

  const records = db.data.learning_records
    .filter(r => r.student_id === student.id && r.score !== null)
    .sort((a, b) => a.record_date.localeCompare(b.record_date));

  const trends: Record<number, { scores: any[]; trend: string }> = {};
  for (const r of records) {
    if (!trends[r.subject_id]) {
      trends[r.subject_id] = { scores: [], trend: 'stable' };
    }
    trends[r.subject_id].scores.push({
      date: r.record_date,
      score: r.score,
      total: r.total_score,
    });
  }

  for (const subjectId in trends) {
    const scores = trends[subjectId].scores;
    if (scores.length >= 2) {
      const first = scores[0].score / scores[0].total;
      const last = scores[scores.length - 1].score / scores[scores.length - 1].total;
      trends[subjectId].trend = last > first ? 'improving' : last < first ? 'declining' : 'stable';
    }
  }

  res.json(trends);
}
