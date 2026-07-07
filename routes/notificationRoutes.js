import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import * as notifController from '../controllers/notificationController.js';

const router = Router();
router.use(authenticate);

router.get('/', notifController.getNotifications);
router.get('/unread-count', notifController.getUnreadCount);
router.patch('/:id/read', notifController.markRead);
router.patch('/read-all', notifController.markAllRead);
router.get('/preferences', notifController.getPreferences);
router.put('/preferences', notifController.updatePreferences);

export default router;