const createError = require('http-errors');

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    throw createError(403, 'Только для админа');
  }
  next();
}

module.exports = adminMiddleware;