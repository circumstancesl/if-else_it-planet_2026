const bcrypt = require('bcryptjs');
const { Users, CandidateProfiles, Companies } = require('../db/models');
const createError = require('http-errors');
const { createTokensAndSession } = require('../utils/session');

async function login(email, password) {
  const user = await Users.findOne({ where: { email } });
  if (!user) {
    throw createError(401, 'Неверный email');
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    throw createError(401, 'Неверный пароль');
  }

  return createTokensAndSession(user)
}

async function registerCandidate(email, password, name) {
  const existingUser = await Users.findOne({ where: { email } });
  if (existingUser) {
    throw createError(400, 'Пользователь уже существует');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = await Users.create({
    email,
    password: hashedPassword,
    name,
    role: 'candidate',
  });

  await CandidateProfiles.create({
    userId: user.id,
  });

  return createTokensAndSession(user);
}

async function registerEmployer(email, password, name) {
  const existingUser = await Users.findOne({ where: { email } });
  if (existingUser) {
    throw createError(400, 'Пользователь уже существует');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = await Users.create({
    email,
    password: hashedPassword,
    name,
    role: 'employer',
  });

  await Companies.create({ name, userId: user.id, verification_status: 'pending' });

  return createTokensAndSession(user);
}

module.exports = { login, registerCandidate, registerEmployer };
