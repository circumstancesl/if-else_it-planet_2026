module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."CandidateProfilesTags" (
        "candidateProfileId" UUID REFERENCES public."CandidateProfiles"(id) ON DELETE CASCADE,
        "tagId" UUID REFERENCES public."Tags"(id) ON DELETE CASCADE,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        PRIMARY KEY ("candidateProfileId", "tagId")
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."CandidateProfilesTags"');
  }
};
