module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
        CREATE TABLE if not exists public."Possibilities" (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" VARCHAR NOT NULL,
        "description" VARCHAR,
        "companyId" UUID REFERENCES public."Companies"(id) ON DELETE CASCADE,
        "type" VARCHAR CHECK ("type" IN('internship', 'vacancy', 'mentorship', 'event')),
        "format" VARCHAR CHECK ("format" IN('office', 'remote', 'hybrid')),
        "city" VARCHAR,
        "address" VARCHAR,
        "latitude" REAL,
        "longitude" REAL,
        "salary" INT,
        "employmentType" VARCHAR CHECK ("employmentType" IN('full', 'partial', 'project')),
        "level" VARCHAR CHECK ("level" IN('junior', 'middle')),
        "contactsEmail" VARCHAR,
        "contactPhone" VARCHAR,
        "date" TIMESTAMP,
        "status" VARCHAR CHECK ("status" IN('draft', 'published', 'archived')) DEFAULT 'draft',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE public."Possibilities"');
  }
};
