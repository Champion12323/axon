import { verifyAccessToken } from '../utils/jwt.js';
import prisma from '../config/prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token missing' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // User suspended check
    const user = await prisma.user.findUnique({
      where:  { id: payload.id },
      select: { id: true, role: true, email: true, isSuspended: true },
    });

    if (!user)             return res.status(401).json({ success: false, message: 'User not found' });
    if (user.isSuspended)  return res.status(403).json({ success: false, message: 'Account suspended' });

    req.user = user;
    next();
  } catch (err) {
    // Access token expired — frontend refresh karega
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired',
        code:    'TOKEN_EXPIRED',  // ← frontend isko check karega
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
};

