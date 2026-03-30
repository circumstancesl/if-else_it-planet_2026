const { ChatsParticipants, Messages, Users } = require('../db/models');

function registerHandlers(io, socket) {
  socket.on('joinChats', async () => {
    const chats = await ChatsParticipants.findAll({
      where: { userId: socket.user.id },
    });

    chats.forEach(c => {
      socket.join(c.chatId);
    });
  });

  socket.on('sendMessage', async ({ chatId, text }) => {
    if (!text) return;

    const message = await Messages.create({
      chatId,
      senderId: socket.user.id,
      text,
    });

    const fullMessage = await Messages.findByPk(message.id, {
      include: [
        {
          model: Users,
          attributes: ['id', 'name'],
        },
      ],
    });

    io.to(chatId).emit('newMessage', fullMessage);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.user.id);
  });
}

module.exports = registerHandlers;