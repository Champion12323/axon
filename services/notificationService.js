import prisma from '../config/prisma.js';

export const getNotifications = async (userId, { type, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const where = { userId, ...(type && { type }) };

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { notifications, unreadCount };
};

export const markRead = async (notificationId, userId) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });
};

export const markAllRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
};

export const getUnreadCount = async (userId) => {
  return prisma.notification.count({ where: { userId, isRead: false } });
};

export const getPreferences = async (userId) => {
  return prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
};

export const updatePreferences = async (userId, data) => {
  return prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
};