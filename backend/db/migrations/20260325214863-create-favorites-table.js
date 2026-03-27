module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."Favorites" (
        "userId" UUID REFERENCES public."Users"(id),
        "type" TEXT CHECK (
          "type" IN ('possibility', 'company')
        ),
        "id" UUID NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
        )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."Favorites"');
  }
};
