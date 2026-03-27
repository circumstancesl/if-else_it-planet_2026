const authenticationMiddleware = require('express').Router();
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const asyncHandler = require('express-async-handler');
const config = require('../config/config.json');

authenticationMiddleware.use(
  asyncHandler((req, res, next) => {
    let token = req.headers['x-access-token'];

    if (!token) {
      const authHeader = req.headers.authorization;
      token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) {
      throw createError(401, 'Токен не предоставлен');
    }

    jwt.verify(token, config.secret, (err, payload) => {
      if (err) {
        throw createError(401, 'Неверный или просроченный токен');
      }
      req.user = {
        id: payload.id,
        role: payload.role,
      };
      next();
    });
  }),
);


module.exports = authenticationMiddleware;
