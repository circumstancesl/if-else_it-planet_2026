const Joi = require('joi');
const createError = require('http-errors');

module.exports = {
  registerSchema: Joi.object({
    password: Joi.string()
      .required()
      .min(5)
      .error(() => createError(400, 'Длина пароля должна быть больше 5 символов')),
    email: Joi.string()
      .required()
      .error(() => createError(400, 'Email обязательное поле')),
    name: Joi.string()
      .required()
      .error(() => createError(400, 'Name обязательное поле')),
  }),
}