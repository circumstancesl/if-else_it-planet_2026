module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."CandidateProfiles"
      ADD COLUMN IF NOT EXISTS "jobTitle" VARCHAR;
    `);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."CandidateProfiles"
      DROP COLUMN IF EXISTS "jobTitle";
    `);
  },
};
