module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Companies"
      ALTER COLUMN "websiteURL" TYPE TEXT[]
      USING ARRAY["websiteURL"];
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE public."Companies"
      ALTER COLUMN "websiteURL" TYPE VARCHAR
      USING "websiteURL"[1];
    `);
  },
};