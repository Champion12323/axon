import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import * as chatController from '../controllers/chatController.js';
const router = Router();

router.use(authenticate);

router.post('/conversations', chatController.startConversation);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);
router.get('/unread', chatController.getUnreadCount);

export default router;