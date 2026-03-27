module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."Companies" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID UNIQUE REFERENCES public."Users"(id) ON DELETE CASCADE,
        "name" VARCHAR NOT NULL,
        "description" VARCHAR,
        "industry" VARCHAR,
        "websiteURL" VARCHAR,
        "verification_status" TEXT CHECK (
          "verification_status" IN ('pending', 'approved', 'rejected')
        ) DEFAULT 'pending',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."Companies"');
  }
};
