const Sequelize = require('sequelize');
const path = require("path");
const fs = require("fs");

const basename = path.basename(__filename);

const db = {};

const sequelize = new Sequelize(
  process.env.DB_SCHEMA || 'itplanet',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true',
    },
    pool: {
      max: 20,
      min: 1,
    },
  },
);

fs.readdirSync(__dirname)
  .filter(
    (file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js',
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

db.connect = async () => {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');

  Sequelize.postgres.DECIMAL.parse = function (value) {
    return parseFloat(value);
  };
};

module.exports = db;
