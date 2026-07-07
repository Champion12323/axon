import * as reviewService from '../services/reviewService.js';
import { createReviewSchema } from '../schemas/reviewSchema.js';

export const createReview = async (req, res) => {
  const data   = createReviewSchema.parse(req.body);
  const review = await reviewService.createReview(req.io, req.user.id, data);
  res.status(201).json({ success: true, data: review });
};

export const getUserReviews = async (req, res) => {
  const result = await reviewService.getUserReviews(
    req.params.userId, req.query
  );
  res.json({ success: true, ...result });
};

export const getReviewStatus = async (req, res) => {
  const status = await reviewService.getReviewStatus(
    req.params.contractId, req.user.id
  );
  res.json({ success: true, data: status });
};

export const markHelpful = async (req, res) => {
  const review = await reviewService.markHelpful(
    req.params.reviewId, req.user.id
  );
  res.json({ success: true, data: review });
};