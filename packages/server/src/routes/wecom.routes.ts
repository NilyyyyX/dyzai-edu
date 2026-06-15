import express from 'express';
import { verifyCallback, receiveMessage, listMessages, receiveWebhook } from '../controllers/wecom.controller';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Callback endpoints (no auth - called by Enterprise WeChat servers)
router.get('/callback', verifyCallback);
router.post('/callback', express.text({ type: ['application/xml', 'text/xml'], limit: '10mb' }), receiveMessage);

// Group chat webhook (no auth - called by Enterprise WeChat)
router.post('/webhook', receiveWebhook);

// Message list (requires auth for frontend)
router.get('/messages', authMiddleware, listMessages);

export default router;
