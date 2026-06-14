import { Request, Response } from 'express';
import { getDb } from '../db/database';
import { homeworkLogSchema } from '../utils/validators';

export async function getProfile(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;

  const student = db.data.students.find(s => s.user_id === userId);
  if (!student) {
    res.status(404).json({ error: 'Student profile not found' });
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = db.data.homework_logs.filter(
    l => l.student_id === student.id && l.date === today
  );

  const unresolvedWeaknesses = db.data.weakness_records.filter(
    w => w.student_id === student.id && !w.resolved_at
  );

  const pointsEntries = db.data.points_ledger.filter(
    p => p.student_id === student.id
  );
  const totalPoints = pointsEntries.reduce((sum, p) => sum + p.amount, 0);

  res.json({
    student,
    today_homework: todayLogs,
    weakness_count: unresolvedWeaknesses.length,
    points: totalPoints,
  });
}

export async function createHomeworkLog(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;
  const data = homeworkLogSchema.parse(req.body);

  const student = db.data.students.find(s => s.user_id === userId);
  if (!student) {
    res.status(404).json({ error: 'Student profile not found' });
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  const existing = db.data.homework_logs.find(
    l => l.student_id === student.id && l.subject_id === data.subject_id && l.date === today
  );

  if (existing) {
    existing.status = data.status;
    existing.difficulty_rating = data.difficulty_rating ?? 0;
    existing.notes = data.notes ?? null;
    await db.write();
    res.json(existing);
    return;
  }

  const log = {
    id: db.data.homework_logs.length + 1,
    student_id: student.id,
    subject_id: data.subject_id,
    date: today,
    status: data.status,
    difficulty_rating: data.difficulty_rating ?? 0,
    notes: data.notes ?? null,
    parent_confirmed: false,
    confirmed_at: null,
    created_at: new Date().toISOString(),
  };
  db.data.homework_logs.push(log);

  if (data.status === 'completed') {
    db.data.points_ledger.push({
      id: db.data.points_ledger.length + 1,
      student_id: student.id,
      amount: 5,
      reason: '完成每日作业',
      reference_type: 'homework_log',
      reference_id: log.id,
      created_at: new Date().toISOString(),
    });
  }

  await db.write();
  res.status(201).json(log);
}

export async function getWeaknesses(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;

  const student = db.data.students.find(s => s.user_id === userId);
  if (!student) {
    res.status(404).json({ error: 'Student profile not found' });
    return;
  }

  const weaknesses = db.data.weakness_records
    .filter(w => w.student_id === student.id && !w.resolved_at)
    .map(w => {
      const kp = db.data.knowledge_points.find(k => k.id === w.knowledge_point_id);
      const subject = kp ? db.data.subjects.find(s => s.id === kp.subject_id) : null;
      return {
        ...w,
        knowledge_point_name: kp?.name || '',
        parent_id: kp?.parent_id || null,
        subject_name: subject?.name || '',
      };
    })
    .sort((a, b) => {
      const severityOrder = { severe: 3, moderate: 2, mild: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.detected_at.localeCompare(a.detected_at);
    });

  res.json(weaknesses);
}

export async function getLatestAnalysis(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;

  const student = db.data.students.find(s => s.user_id === userId);
  if (!student) {
    res.status(404).json({ error: 'Student profile not found' });
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
