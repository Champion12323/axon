import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import * as searchController from '../controllers/searchController.js';
const router = Router();

router.use(authenticate);

// Sirf brands search kar sakein
router.get('/', requireRole('BRAND'), searchController.search);
router.post('/save/:influencerId', requireRole('BRAND'), searchController.toggleSave);
router.get('/saved', requireRole('BRAND'), searchController.getSaved);

export default router;