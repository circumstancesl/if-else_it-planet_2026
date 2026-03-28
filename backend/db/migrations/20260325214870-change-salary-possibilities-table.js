module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Possibilities" 
      ALTER COLUMN "salary" TYPE VARCHAR;
    `);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Possibilities" 
      ALTER COLUMN "salary" TYPE INTEGER;
    `);
  },
};