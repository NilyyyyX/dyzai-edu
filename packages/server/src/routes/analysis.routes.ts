import { Router } from 'express';
import {
  triggerAnalysis,
  getLatestReport,
  getReportHistory,
  getScoreTrends,
} from '../controllers/analysis.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['parent']));

router.post('/:studentId/generate', triggerAnalysis);
router.get('/:studentId', getLatestReport);
router.get('/:studentId/history', getReportHistory);
router.get('/:studentId/trends', getScoreTrends);

export default router;
