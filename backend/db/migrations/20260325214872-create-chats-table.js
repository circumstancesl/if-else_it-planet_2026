module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."Chats" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."Chats"');
  }
};
