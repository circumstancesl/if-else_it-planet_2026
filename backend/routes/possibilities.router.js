const routerPossibility = require('express').Router();
const asyncHandler = require('express-async-handler');
const Joi = require('joi');

const employerMiddleware = require('../middleware/employer.middleware');

const {
  createPossibility,
} = require('../controllers/possibilities.controller');

routerPossibility.post(
  '/',
  employerMiddleware,
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional(),

      type: Joi.string().valid('job', 'internship', 'event', 'mentorship'),

      format: Joi.string().valid('office', 'remote', 'hybrid'),

      city: Joi.string().optional(),
      address: Joi.string().optional(),

      salary_from: Joi.number().optional(),
      salary_to: Joi.number().optional(),

      contacts_email: Joi.string().email().optional(),
      contacts_phone: Joi.string().optional(),
    });

    await schema.validateAsync(req.body);

    const result = await createPossibility(req.user.id, req.body);
    res.send(result);
  }),
);

module.exports = routerPossibility;