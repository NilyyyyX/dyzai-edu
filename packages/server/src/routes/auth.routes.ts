import { Router } from 'express';
import { register, login, registerStudent, me } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/register-student', authMiddleware, registerStudent);
router.get('/me', authMiddleware, me);

export default router;
