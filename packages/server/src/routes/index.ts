import { Router } from 'express';
import authRoutes from './auth.routes';
import parentRoutes from './parent.routes';
import studentRoutes from './student.routes';
import analysisRoutes from './analysis.routes';
import chatAnalysisRoutes from './chat-analysis.routes';
import wecomRoutes from './wecom.routes';
import { getDb } from '../db/database';

const router = Router();

router.use('/auth', authRoutes);
router.use('/parent', parentRoutes);
router.use('/student', studentRoutes);
router.use('/analysis', analysisRoutes);
router.use('/chat-analysis', chatAnalysisRoutes);
router.use('/wecom', wecomRoutes);

// Public: subjects list
router.get('/subjects', async (_req, res) => {
  const db = await getDb();
  res.json(db.data.subjects);
});

// Public: knowledge points tree
router.get('/knowledge-points/:subjectId', async (req, res) => {
  const db = await getDb();
  const points = db.data.knowledge_points
    .filter(kp => kp.subject_id === parseInt(req.params.subjectId))
    .sort((a, b) => a.sort_order - b.sort_order);

  // Build tree
  const tree: any[] = [];
  const map = new Map<string, any>();

  for (const p of points) {
    map.set(p.id, { ...p, children: [] });
  }

  for (const p of points) {
    const node = map.get(p.id);
    if (p.parent_id && map.has(p.parent_id)) {
      map.get(p.parent_id).children.push(node);
    } else {
      tree.push(node);
    }
  }

  res.json(tree);
});

export default router;
