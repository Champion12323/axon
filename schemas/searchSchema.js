import {z} from 'zod';

export const searchSchema = z.object({
  query: z.string().max(300).optional(),       // semantic search text
  niches: z.array(z.string()).optional(),
  minFollowers: z.coerce.number().optional(),
  maxFollowers: z.coerce.number().optional(),
  minEngagement: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
  location: z.string().optional(),
  sortBy: z.enum(['match', 'engagement', 'followers', 'price']).default('match'),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(50).default(20),
});
