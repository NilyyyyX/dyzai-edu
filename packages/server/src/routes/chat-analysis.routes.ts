import { Router } from 'express';
import { analyzeChat, saveWeaknesses } from '../controllers/chat-analysis.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['parent']));

router.post('/analyze', analyzeChat);
router.post('/save-weaknesses', saveWeaknesses);

export default router;
