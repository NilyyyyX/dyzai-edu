import { Router } from 'express';
import {
  getProfile,
  createHomeworkLog,
  getWeaknesses,
  getLatestAnalysis,
} from '../controllers/student.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['student']));

router.get('/profile', getProfile);
router.post('/homework', createHomeworkLog);
router.get('/weaknesses', getWeaknesses);
router.get('/analysis/latest', getLatestAnalysis);

export default router;
