module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Responses"
      RENAME COLUMN "possibilityID" TO "possibilityId";
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Responses"
      RENAME COLUMN "possibilityId" TO "possibilityID";
    `);
  },
};