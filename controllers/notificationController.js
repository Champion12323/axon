import * as notifService from '../services/notificationService.js';

export const getNotifications = async (req, res) => {
  const { type, page, limit } = req.query;
  const result = await notifService.getNotifications(req.user.id, { type, page, limit });
  res.json({ success: true, ...result });
};

export const markRead = async (req, res) => {
  await notifService.markRead(req.params.id, req.user.id);
  res.json({ success: true });
};

export const markAllRead = async (req, res) => {
  await notifService.markAllRead(req.user.id);

  // Socket se unread count 0 broadcast karo
  req.io.to(`user:${req.user.id}`).emit('unread_count', { count: 0 });

  res.json({ success: true });
};

export const getUnreadCount = async (req, res) => {
  const count = await notifService.getUnreadCount(req.user.id);
  res.json({ success: true, data: { count } });
};

export const getPreferences = async (req, res) => {
  const prefs = await notifService.getPreferences(req.user.id);
  res.json({ success: true, data: prefs });
};

export const updatePreferences = async (req, res) => {
  const prefs = await notifService.updatePreferences(req.user.id, req.body);
  res.json({ success: true, data: prefs });
};