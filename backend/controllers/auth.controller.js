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
  if (!isCorporateEmail(email)) {
    throw createError(400, 'Только корпоративные почты разрешены');
  }

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

function isCorporateEmail(email) {
  const domain = email.split('@')[1].toLowerCase();
  return !blockedDomains.includes(domain);
}

const blockedDomains = [
  'gmail.com',
  'yahoo.com',
  'yandex.ru',
  'hotmail.com',
  'outlook.com',
  'mail.ru',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'zoho.com',
  'gmx.com',
  'yahoo.co.uk',
  'yahoo.com.au',
  'yahoo.ca',
  'live.com',
  'msn.com',
  'inbox.com',
  'fastmail.com',
  'tutanota.com',
  'hushmail.com',
  'bk.ru',
  'list.ru',
  'rambler.ru'
];

module.exports = { login, registerCandidate, registerEmployer };
