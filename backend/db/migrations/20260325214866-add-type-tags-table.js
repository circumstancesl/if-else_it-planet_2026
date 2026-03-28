module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Tags"
      ADD COLUMN IF NOT EXISTS "type" VARCHAR CHECK ("type" IN ('level', 'employmentType', 'technology')) NOT NULL DEFAULT 'technology';
    `);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Tags"
      DROP COLUMN IF EXISTS "type";
    `);
  },
};
