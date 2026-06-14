import { Router } from 'express';
import {
  getStudents,
  createLearningRecord,
  uploadImage,
  getLearningRecords,
  getPendingHomework,
  confirmHomework,
} from '../controllers/parent.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['parent']));

router.get('/students', getStudents);
router.post('/learning-records', createLearningRecord);
router.post('/learning-records/upload', upload.single('image'), uploadImage);
router.get('/learning-records/:studentId', getLearningRecords);
router.get('/homework/:studentId/pending', getPendingHomework);
router.put('/homework/:logId/confirm', confirmHomework);

export default router;
