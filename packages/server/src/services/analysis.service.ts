import { getDb } from '../db/database';
import { aiService, type AnalysisResult } from './ai.service';

interface AnalysisInput {
  studentId: number;
  reportType: 'weekly' | 'monthly' | 'subject';
  subjectId?: number;
}

export async function generateAnalysis(input: AnalysisInput): Promise<any> {
  const db = await getDb();
  const { studentId, reportType, subjectId } = input;

  // Check rate limit: max 1 analysis per student per hour
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const recent = db.data.analysis_reports.find(
    r => r.student_id === studentId && r.generated_at > oneHourAgo
  );
  if (recent) {
    return { error: 'Analysis already generated within the last hour', existing: recent };
  }

  // Get student info
  const student = db.data.students.find(s => s.id === studentId);
  if (!student) throw new Error('Student not found');

  // Get parent info
  const parent = db.data.users.find(u => u.id === student.parent_id);

  // Determine date range
  const now = new Date();
  let startDate: Date;
  if (reportType === 'weekly') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (reportType === 'monthly') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const startDateStr = startDate.toISOString().split('T')[0];

  // Collect learning records
  let records = db.data.learning_records
    .filter(r => r.student_id === studentId && r.record_date >= startDateStr);

  if (subjectId) {
    records = records.filter(r => r.subject_id === subjectId);
  }

  // Enrich with subject names
  const recordsWithSubjects = records.map(r => {
    const subject = db.data.subjects.find(s => s.id === r.subject_id);
    return { ...r, subject_name: subject?.name || '' };
  }).sort((a, b) => b.record_date.localeCompare(a.record_date));

  // Collect homework logs
  let homeworkLogs = db.data.homework_logs
    .filter(h => h.student_id === studentId && h.date >= startDateStr);

  if (subjectId) {
    homeworkLogs = homeworkLogs.filter(h => h.subject_id === subjectId);
  }

  // Call AI service
  const result: AnalysisResult = await aiService.analyze({
    studentName: student.name,
    grade: student.grade,
    records: recordsWithSubjects,
    homeworkLogs,
  });

  // Build trend data
  const scoreRecords = recordsWithSubjects.filter(r => r.score !== null);
  const trendData = scoreRecords.length > 0
    ? {
        scores: scoreRecords.map(r => ({
          date: r.record_date,
          score: r.score,
          total: r.total_score,
        })),
        trend: result.score_trend,
      }
    : null;

  // Insert analysis report
  const report = {
    id: db.data.analysis_reports.length + 1,
    student_id: studentId,
    report_type: reportType,
    subject_id: subjectId || null,
    summary: result.summary,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    recommendations: result.recommendations,
    trend_data: trendData,
    generated_at: new Date().toISOString(),
  };
  db.data.analysis_reports.push(report);
  await db.write();

  // Update weakness records
  await syncWeaknessRecords(studentId, result.weaknesses);

  return report;
}

async function syncWeaknessRecords(studentId: number, weaknesses: AnalysisResult['weaknesses']): Promise<void> {
  const db = await getDb();

  const existing = db.data.weakness_records.filter(
    r => r.student_id === studentId && !r.resolved_at
  );
  const existingKPIds = new Set(existing.map(r => r.knowledge_point_id));
  const newKPNames = new Map(weaknesses.map(w => [w.knowledge_point, w.severity]));

  // Try to match weaknesses to knowledge_points by name
  const allKPs = db.data.knowledge_points;
  const kpNameToId = new Map<string, string>();
  for (const kp of allKPs) {
    kpNameToId.set(kp.name, kp.id);
    // Also try partial match
    for (const [name] of newKPNames) {
      if (name.includes(kp.name) || kp.name.includes(name)) {
        kpNameToId.set(name, kp.id);
      }
    }
  }

  // Insert new weaknesses
  for (const w of weaknesses) {
    const kpId = kpNameToId.get(w.knowledge_point);
    if (!kpId) continue;

    const found = db.data.weakness_records.find(
      r => r.student_id === studentId && r.knowledge_point_id === kpId && !r.resolved_at
    );

    if (!found) {
      db.data.weakness_records.push({
        id: db.data.weakness_records.length + 1,
        student_id: studentId,
        knowledge_point_id: kpId,
        severity: w.severity,
        detected_at: new Date().toISOString(),
        resolved_at: null,
        source: 'ai_analysis',
      });
    } else {
      const severityOrder = { mild: 1, moderate: 2, severe: 3 };
      if (severityOrder[w.severity] > severityOrder[found.severity as keyof typeof severityOrder]) {
        found.severity = w.severity;
      }
    }
  }

  await db.write();
}
