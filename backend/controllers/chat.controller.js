const createError = require('http-errors');
const { Chats, Users, ChatsParticipants, Messages } = require('../db/models');

async function createChat(currentUserId, targetUserId) {
  if (currentUserId === targetUserId) {
    throw createError(400, 'Нельзя создать чат с самим собой');
  }

  const existingChats = await Chats.findAll({
    include: [
      {
        model: Users,
        attributes: ['id'],
      },
    ],
  });

  const existing = existingChats.find(chat => {
    const userIds = chat.Users.map(u => u.id);
    return (
      userIds.includes(currentUserId) &&
      userIds.includes(targetUserId) &&
      userIds.length === 2
    );
  });

  if (existing) {
    return existing;
  }

  const chat = await Chats.create();

  await chat.addUsers([currentUserId, targetUserId]);

  return chat;
}

async function getMyChats(userId) {
  const chats = await Chats.findAll({
    include: [
      {
        model: Users,
        attributes: ['id', 'name'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return chats.filter(chat =>
    chat.Users.some(u => u.id === userId)
  );
}

async function getChatMessages(userId, chatId) {
  const chat = await Chats.findByPk(chatId, {
    include: [{ model: Users, attributes: ['id'] }],
  });

  if (!chat) {
    throw createError(404, 'Чат не найден');
  }

  const isParticipant = chat.Users.some(u => u.id === userId);

  if (!isParticipant) {
    throw createError(403, 'Нет доступа к чату');
  }

  const messages = await Messages.findAll({
    where: { chatId },
    include: [
      {
        model: Users,
        attributes: ['id', 'name'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  return messages;
}

module.exports = {
  getMyChats,
  getChatMessages,
  createChat,
}