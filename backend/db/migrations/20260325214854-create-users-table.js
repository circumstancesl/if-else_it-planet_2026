module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."Users" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR UNIQUE NOT NULL,
        "password" VARCHAR NOT NULL,
        "role" VARCHAR CHECK (role IN('candidate', 'curator', 'employer', 'admin')),
        "name" VARCHAR NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."Users"');
  }
};
