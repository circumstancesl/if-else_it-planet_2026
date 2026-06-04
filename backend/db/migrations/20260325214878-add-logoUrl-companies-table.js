module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Companies"
      ADD COLUMN IF NOT EXISTS "logoUrl" VARCHAR;
    `);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Companies"
      DROP COLUMN IF EXISTS "logoUrl";
    `);
  },
};
