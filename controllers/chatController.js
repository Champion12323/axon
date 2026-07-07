import * as chatService from '../services/chatService.js';
import { createConversationSchema, sendMessageSchema } from '../schemas/chatSchema.js';
import {emitNotification} from  "../notificationCenter/notificationEmitter.js"

export const startConversation = async (req, res) => {
  const { influencerId, campaignId } = createConversationSchema.parse(req.body);
  const conversation = await chatService.getOrCreateConversation(
    req.user.id, influencerId, campaignId
  );
  res.status(200).json({ success: true, data: conversation });
};

export const getConversations = async (req, res) => {
  const conversations = await chatService.getUserConversations(req.user.id);
  res.json({ success: true, data: conversations });
};

export const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { cursor, limit } = req.query;
  const messages = await chatService.getMessages(
    conversationId, cursor, Number(limit) || 30
  );
  // Mark as read
  await chatService.markMessagesRead(conversationId, req.user.id);
  res.json({ success: true, data: messages.reverse() }); // oldest first
};

export const sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const data = sendMessageSchema.parse(req.body);
  const message = await chatService.createMessage(conversationId, req.user.id, data);

  // Socket.IO se emit karo (real-time)
  req.io.to(conversationId).emit('new_message', message);

  res.status(201).json({ success: true, data: message });
};

export const getUnreadCount = async (req, res) => {
  const count = await chatService.getUnreadCount(req.user.id);
  res.json({ success: true, data: { unread: count } });
};