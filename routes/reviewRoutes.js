import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import * as reviewController from '../controllers/reviewController.js';

const router = Router();
router.use(authenticate);

router.post('/',                              reviewController.createReview);
router.get('/user/:userId',                   reviewController.getUserReviews);   // public
router.get('/status/:contractId',             reviewController.getReviewStatus);
router.post('/:reviewId/helpful',             reviewController.markHelpful);

export default router;