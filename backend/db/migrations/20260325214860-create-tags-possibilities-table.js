module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."PossibilitiesTags" (
        "possibilityId" UUID REFERENCES public."Possibilities"(id) ON DELETE CASCADE,
        "tagId" UUID REFERENCES public."Tags"(id) ON DELETE CASCADE,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        PRIMARY KEY ("possibilityId", "tagId")
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."PossibilitiesTags"');
  }
};
