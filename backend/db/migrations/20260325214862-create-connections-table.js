module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."Connections" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "requesterId" UUID REFERENCES public."Users"(id),
        "receiverId" UUID REFERENCES public."Users"(id),
        "status" TEXT CHECK (
          "status" IN ('pending', 'accepted', 'rejected')
        ) DEFAULT 'pending',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."Connections"');
  }
};
