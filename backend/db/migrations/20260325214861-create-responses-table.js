module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."Responses" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "candidateId" UUID REFERENCES public."Users"(id) ON DELETE CASCADE,
        "possibilityID" UUID REFERENCES public."Possibilities"(id) ON DELETE CASCADE,
        "status" TEXT CHECK (
          "status" IN ('pending', 'accepted', 'rejected', 'reserve')
        ) DEFAULT 'pending',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."Responses"');
  }
};
