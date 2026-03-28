module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Possibilities"
      DROP COLUMN IF EXISTS "employmentType",
      DROP COLUMN IF EXISTS "level";
    `);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Possibilities"
        ADD COLUMN IF NOT EXISTS "employmentType" VARCHAR CHECK ("employmentType" IN ('full', 'partial', 'project')),
        ADD COLUMN IF NOT EXISTS "level" VARCHAR CHECK ("level" IN ('junior', 'middle'));
    `);
  },
}
