import { z } from 'zod';

export const createReviewSchema = z.object({
  contractId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10).max(1000),
  tags: z.array(z.string().max(30)).max(5).default([]),
});

export const markHelpfulSchema = z.object({
  reviewId: z.string().cuid(),
});