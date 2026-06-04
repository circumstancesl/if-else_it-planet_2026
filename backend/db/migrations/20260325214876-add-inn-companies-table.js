module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Companies"
      ADD COLUMN IF NOT EXISTS "inn" VARCHAR;
    `);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Companies"
      DROP COLUMN IF EXISTS "inn";
    `);
  },
};
