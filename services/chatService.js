import prisma from '../config/prisma.js';

export const getOrCreateConversation = async (brandId, influencerId, campaignId) => {
  const existing = await prisma.conversation.findFirst({
    where: { brandId, influencerId, campaignId: campaignId ?? null },
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: { brandId, influencerId, campaignId },
    include: { campaign: { select: { id: true, title: true } } },
  });
};

export const getUserConversations = async (userId) => {
  return prisma.conversation.findMany({
    where: { OR: [{ brandId: userId }, { influencerId: userId }] },
    include: {
      campaign: { select: { id: true, title: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1, // last message preview
      },
      brand: { select: { id: true, name: true, avatar: true } },
      influencer: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

export const getMessages = async (conversationId, cursor, limit = 30) => {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });
};

export const createMessage = async (conversationId, senderId, data) => {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, ...data },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
  return message;
};

export const markMessagesRead = async (conversationId, userId) => {
  return prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true, readAt: new Date() },
  });
};

export const getUnreadCount = async (userId) => {
  return prisma.message.count({
    where: {
      conversation: { OR: [{ brandId: userId }, { influencerId: userId }] },
      senderId: { not: userId },
      isRead: false,
    },
  });
};