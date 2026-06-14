import { getDb } from '../db/database';
import { SUBJECTS, flattenKnowledgePoints } from '@learning/shared';

export async function runSeeds() {
  const db = await getDb();
  console.log('DB loaded, subjects count:', db.data.subjects.length);
  console.log('DB path:', (process as any).env?.DB_PATH || './db/dev.sqlite3.json');

  // Seed subjects
  if (db.data.subjects.length === 0) {
    for (const subject of SUBJECTS) {
      db.data.subjects.push({
        id: subject.id,
        name: subject.name,
        code: subject.code,
      });
    }
    await db.write();
    console.log('Seeded subjects');
  } else {
    console.log('Subjects already seeded, skipping');
  }

  // Seed knowledge points
  if (db.data.knowledge_points.length === 0) {
    const kps = flattenKnowledgePoints();
    for (const kp of kps) {
      db.data.knowledge_points.push({
        id: kp.id,
        subject_id: kp.subjectId,
        parent_id: kp.parentId,
        name: kp.name,
        level: kp.level,
        sort_order: kp.sortOrder,
      });
    }
    await db.write();
    console.log(`Seeded ${kps.length} knowledge points`);
  } else {
    console.log('Knowledge points already seeded, skipping');
  }
}
