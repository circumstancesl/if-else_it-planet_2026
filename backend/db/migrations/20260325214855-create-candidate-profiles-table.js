module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."CandidateProfiles" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID UNIQUE REFERENCES public."Users"(id) ON DELETE CASCADE,
        "fullName" VARCHAR,
        "university" VARCHAR,
        "graduationYear" INT,
        "about" VARCHAR,
        "resumeURL" VARCHAR,
        "profileVisible" BOOLEAN DEFAULT 'true',
        "applicationsVisible" BOOLEAN DEFAULT 'true',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."CandidateProfiles"');
  }
};
