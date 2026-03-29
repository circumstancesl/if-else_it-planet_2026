const createError = require('http-errors');

function candidateMiddleware(req, res, next) {
  if (req.user.role !== 'candidate') {
    throw createError(403, 'Только для соискателей');
  }
  next();
}

module.exports = candidateMiddleware;