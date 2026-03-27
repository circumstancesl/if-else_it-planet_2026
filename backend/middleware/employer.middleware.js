const createError = require('http-errors');

function employerMiddleware(req, res, next) {
  if (req.user.role !== 'employer') {
    throw createError(403, 'Только для работодателей');
  }
  next();
}

module.exports = employerMiddleware;