module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."ChatsParticipants" (
        "chatId" UUID REFERENCES public."Chats"(id) ON DELETE CASCADE,
        "userId" UUID REFERENCES public."Users"(id) ON DELETE CASCADE,
        PRIMARY KEY ("chatId", "userId"),
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."ChatsParticipants"');
  }
};
