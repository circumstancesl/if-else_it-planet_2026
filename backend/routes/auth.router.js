const routerAuth = require('express').Router();
const asyncHandler = require('express-async-handler');
const Joi = require('joi');
const createError = require('http-errors');
const { login, registerCandidate, registerEmployer } = require('../controllers/auth.controller');
const {
  registerSchema,
} = require('../joiDefaultSchemas');

routerAuth.post(
  '/login',
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      password: Joi.string()
        .required()
        .min(5)
        .error(() => createError(400, 'Длина пароля должна быть больше 5 символов')),
      email: Joi.string()
        .required()
        .error(() => createError(400, 'Email обязательное поле')),
    });
    await schema.validateAsync(req.body);

    res.send(await login(req.body.email, req.body.password));
  }),
);

routerAuth.post(
  '/register/candidate',
  asyncHandler(async (req, res) => {
    await registerSchema.validateAsync(req.body);

    res.send(await registerCandidate(req.body.email, req.body.password, req.body.name));
  }),
);

routerAuth.post(
  '/register/employer',
  asyncHandler(async (req, res) => {
    await registerSchema.validateAsync(req.body);

    res.send(await registerEmployer(req.body.email, req.body.password, req.body.name));
  }),
);

module.exports = routerAuth;
