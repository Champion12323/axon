import prisma from '../config/prisma.js';
import { sendEmail } from '../utils/mailer.js';

const PREF_MAP = {
  MESSAGE:  { inApp: 'inAppMessage',  email: 'emailMessage' },
  CAMPAIGN: { inApp: 'inAppCampaign', email: 'emailCampaign' },
  CONTRACT: { inApp: 'inAppContract', email: 'emailContract' },
  PAYMENT:  { inApp: 'inAppPayment',  email: 'emailPayment' },
  SYSTEM:   { inApp: 'inAppSystem',   email: null },
};

export const emitNotification = async (io, {
  userId,
  type,       // 'MESSAGE' | 'CAMPAIGN' | 'CONTRACT' | 'PAYMENT' | 'SYSTEM'
  title,
  body,
  link,
  meta = {},
}) => {
  // 1. User preferences check
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
  const prefKeys = PREF_MAP[type];

  const inAppEnabled = !prefs || prefs[prefKeys.inApp] !== false;
  const emailEnabled = prefKeys.email && (!prefs || prefs[prefKeys.email] !== false);

  // 2. Save to DB (always — for notification history)
  const notification = await prisma.notification.create({
    data: { userId, type, title, body, link, meta, isRead: !inAppEnabled },
  });

  // 3. Real-time socket emit
  if (inAppEnabled && io) {
    io.to(`user:${userId}`).emit('notification', {
      id: notification.id,
      type,
      title,
      body,
      link,
      createdAt: notification.createdAt,
    });

    // Unread count update
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    io.to(`user:${userId}`).emit('unread_count', { count: unreadCount });
  }

  // 4. Email (async — don't await, fire and forget)
  if (emailEnabled) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (user?.email) {
      sendEmailNotification({ to: user.email, name: user.name, title, body, link }).catch(console.error);
    }
  }

  return notification;
};