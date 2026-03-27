const { Sessions } = require('../db/models');

async function rejectToken(token) {
  return Sessions.destroy({ where: { refreshToken: token } });
}

module.exports = {
  rejectToken,
};