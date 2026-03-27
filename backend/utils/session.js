const jwt = require('jsonwebtoken');
const config = require('../config/config.json');
const randToken = require('rand-token');

const {
  accessTokenLifeTime,
  refreshTokenLifeTime,
} = config;

const { Sessions } = require('../db/models');

async function createTokensAndSession(user) {
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    config.secret,
    { expiresIn: accessTokenLifeTime },
  );
  const refreshToken = randToken.uid(128);
  await Sessions.create({
    userId: user.id,
    refreshToken,
    expiresIn: refreshTokenLifeTime + Date.now(),
  });
  return { token, refreshToken };
}

module.exports = { createTokensAndSession };
