module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."Messages" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "chatId" UUID REFERENCES public."Chats"(id) ON DELETE CASCADE,
        "senderId" UUID REFERENCES public."Users"(id),
        "text" TEXT NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."Messages"');
  }
};
