module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."CandidateProfiles"
      ADD COLUMN IF NOT EXISTS "logoUrl" VARCHAR;
    `);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."CandidateProfiles"
      DROP COLUMN IF EXISTS "logoUrl";
    `);
  },
};
