const createError = require('http-errors');
const { Users } = require('../db/models');
const bcrypt = require('bcryptjs');

async function createCurator(email, password, name) {
  const existingUser = await Users.findOne({ where: { email } });
  if (existingUser) {
    throw createError(400, 'Пользователь с таким email уже существует');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const curator = await Users.create({
    email,
    password: hashedPassword,
    name,
    role: 'curator',
  });

  return curator;
}

async function deleteCurator(id) {
  const curator = await Users.findOne({ where: { id, role: 'curator' } });

  if (!curator) {
    throw createError(404, 'Куратор не найден');
  }

  await curator.destroy();

  return 'success';
}

async function getCurators() {
  const curators = await Users.findAll({
    order: [['name', 'ASC']],
    where: { role: 'curator' },
  });

  return curators;
}

module.exports = {
  createCurator,
  deleteCurator,
  getCurators,
}