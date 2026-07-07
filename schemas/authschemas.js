// ============================================
//  Auth Validation Schemas (Zod)
// ============================================
 
import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password too long')
  .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include upper, lower & number');

export const authSchemas = {

  register: z.object({
  body: z.object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must include upper, lower & number"),
    full_name: z.string().optional(),
    role: z.string(),
    mobile: z.string().optional(),
  })
}),

  login: z.object({
    body: z.object({
      email: z.string().email().toLowerCase(),
      password: z.string().min(1),
    }),
  }),

  forgotPassword: z.object({
    body: z.object({
      email: z.string().email().toLowerCase(),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      token: z.string().min(1),
      password: passwordSchema,
    }),
  }),

};