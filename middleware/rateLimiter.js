import rateLimit from 'express-rate-limit';

export const rateLimiter = (requests, windowMs) => rateLimit({
  windowMs: windowMs * 1,
  max: requests,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
