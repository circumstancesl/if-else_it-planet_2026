module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Possibilities"
      DROP COLUMN IF EXISTS "contactsEmail",
      DROP COLUMN IF EXISTS "contactPhone";
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Possibilities"
      ADD COLUMN IF NOT EXISTS "contactsEmail" VARCHAR,
      ADD COLUMN IF NOT EXISTS "contactPhone" VARCHAR;
    `);
  },
};