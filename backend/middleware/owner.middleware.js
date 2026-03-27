const createError = require('http-errors');

function ownerMiddleware(req, res, next) {
  const currentUser = req.user;
  const targetUserId = req.params.id;

  if (!currentUser) {
    throw createError(401, 'Не авторизован');
  }

  if (currentUser.id === targetUserId) {
    return next();
  }

  throw createError(403, 'Нет доступа');
}

module.exports = ownerMiddleware;