import { z } from 'zod';

export const createConversationSchema = z.object({
  influencerId: z.string().cuid(),
  campaignId: z.string().cuid().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().max(500).optional(),
  fileUrl: z.string().url().optional(),
  fileType: z.enum(['image', 'pdf', 'doc']).optional(),
  fileName: z.string().optional(),
}).refine(d => d.content || d.fileUrl, {
  message: 'Message must have content or a file',
});