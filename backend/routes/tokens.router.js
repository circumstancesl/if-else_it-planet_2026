const routerToken = require('express').Router();
const asyncHandler = require('express-async-handler');
const createError = require('http-errors');
const Joi = require('joi');
const { rejectToken } = require('../controllers/tokens.controller');

routerToken.post(
  '/rejectToken',
  asyncHandler(async (req, res) => {
    const token = req.body.refreshToken;
    const schema = Joi.object({
      refreshToken: Joi.string()
        .required()
        .error(() => createError('refreshToken должен быть строкой')),
    });
    await schema.validateAsync(req.body);
    await rejectToken(token);
    res.json({ message: 'success' });
  }),
);

module.exports = routerToken;