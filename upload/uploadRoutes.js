import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import * as uploadController from './uploadController.js';

const router = Router();
router.use(authenticate);

router.post('/presigned-url', uploadController.getPresignedUrl);
router.post('/confirm',       uploadController.confirmUpload);
router.delete('/file',        uploadController.deleteFile);

export default router;