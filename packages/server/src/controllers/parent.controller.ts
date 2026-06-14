import { Request, Response } from 'express';
import { getDb } from '../db/database';
import { learningRecordSchema } from '../utils/validators';

export async function getStudents(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;

  const students = db.data.students
    .filter(s => s.parent_id === userId)
    .map(student => {
      const user = db.data.users.find(u => u.id === student.user_id);
      return {
        ...student,
        phone: user?.phone || '',
        nickname: user?.nickname || '',
      };
    });

  res.json(students);
}

export async function createLearningRecord(req: Request, res: Response) {
  const db = await getDb();
  const { userId } = req.user!;
  const data = learningRecordSchema.parse(req.body);

  const student = db.data.students.find(
    s => s.id === data.student_id && s.parent_id === userId
  );
  if (!student) {
    res.status(403).json({ error: 'Student not found' });
    return;
  }

  const record = {
    id: db.data.learning_records.length + 1,
    student_id: data.student_id,
    subject_id: data.subject_id,
    type: data.type,
    title: data.title,
    score: data.score ?? null,
    total_score: data.total_score ?? null,
    teacher_feedback: data.teacher_feedback ?? null,
    wrong_items: data.wrong_items ?? null,
    image_urls: data.image_urls ?? null,
    record_date: data.record_date,
    created_at: new Date().toISOString(),
  };
  db.data.learning_records.push(record);
  await db.write();

  res.status(201).json(record);
}

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
}

export async function getLearningRecords(req: Request, res: Response) {
  const db = await getDb();
  const { studentId } = req.params;
  const { userId } = req.user!;

  const student = db.data.students.find(
    s => s.id === parseInt(studentId) && s.parent_id === userId
  );
  if (!student) {
    res.status(403).json({ error: 'Student not found' });
    return;
  }

  const records = db.data.learning_records
    .filter(r => r.student_id === student.id)
    .sort((a, b) => b.record_date.localeCompare(a.record_date));

  res.json(records);
}

export async function getPendingHomework(req: Request, res: Response) {
  const db = await getDb();
  const { studentId } = req.params;
  const { userId } = req.user!;

  const student = db.data.students.find(
    s => s.id === parseInt(studentId) && s.parent_id === userId
  );
  if (!student) {
    res.status(403).json({ error: 'Student not found' });
    return;
  }

  const logs = db.data.homework_logs
    .filter(l => l.student_id === student.id && !l.parent_confirmed)
    .sort((a, b) => b.date.localeCompare(a.date));

  res.json(logs);
}

export async function confirmHomework(req: Request, res: Response) {
  const db = await getDb();
  const { logId } = req.params;
  const { userId } = req.user!;

  const log = db.data.homework_logs.find(l => l.id === parseInt(logId));
  if (!log) {
    res.status(404).json({ error: 'Homework log not found' });
    return;
  }

  const student = db.data.students.find(
    s => s.id === log.student_id && s.parent_id === userId
  );
  if (!student) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }

  log.parent_confirmed = true;
  log.confirmed_at = new Date().toISOString();
  await db.write();

  res.json({ success: true });
}
