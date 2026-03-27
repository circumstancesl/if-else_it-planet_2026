module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."EmployerProfiles" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID UNIQUE REFERENCES public."Users"(id) ON DELETE CASCADE,
        "companyId" UUID REFERENCES public."Companies"(id) ON DELETE SET NULL,
        "position" VARCHAR,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."EmployerProfiles"');
  }
};
