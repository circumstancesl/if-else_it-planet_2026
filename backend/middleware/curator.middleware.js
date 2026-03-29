const createError = require('http-errors');

function curatorMiddleware(req, res, next) {
  if (req.user.role !== 'curator') {
    throw createError(403, 'Только для кураторов');
  }
  next();
}

module.exports = curatorMiddleware;