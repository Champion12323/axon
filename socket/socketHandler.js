import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  // JWT auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.id}`);
    socket.join(`user:${socket.user.id}`);

    // User apne conversations ke rooms join karta hai
    socket.on('join_conversations', async () => {
      const convs = await prisma.conversation.findMany({
        where: { OR: [{ brandId: socket.user.id }, { influencerId: socket.user.id }] },
        select: { id: true },
      });
      convs.forEach(c => socket.join(c.id));
    });

    // Typing indicator
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(conversationId).emit('user_typing', {
        userId: socket.user.id,
        conversationId,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(conversationId).emit('user_stopped_typing', {
        userId: socket.user.id,
        conversationId,
      });
    });

    // Read receipt
    socket.on('messages_read', ({ conversationId }) => {
      socket.to(conversationId).emit('messages_seen', {
        userId: socket.user.id,
        conversationId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};