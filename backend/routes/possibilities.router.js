const routerPossibility = require('express').Router();
const asyncHandler = require('express-async-handler');
const Joi = require('joi');

const companyVerificationMiddleware = require('../middleware/companyVerification.middleware');
const employerMiddleware = require('../middleware/employer.middleware')

const {
  createPossibility,
  getPossibility,
  getMyPossibilities,
  deletePossibility,
  updatePossibility,
} = require('../controllers/possibilities.controller');

routerPossibility.post(
  '/',
  companyVerificationMiddleware,
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional(),

      type: Joi.string().valid('internship', 'vacancy', 'mentorship', 'event').required(),
      format: Joi.string().valid('office', 'remote', 'hybrid').required(),

      city: Joi.string().optional(),
      address: Joi.string().optional(),

      latitude: Joi.number().optional(),
      longitude: Joi.number().optional(),
      salary: Joi.number().optional(),

      date: Joi.date().optional(),

      tagIds: Joi.array()
        .items(Joi.string().uuid())
        .min(1)
        .required(),
    });

    await schema.validateAsync(req.body);

    const result = await createPossibility(req.user.id, req.body);

    res.send(result);
  }),
);

routerPossibility.get(
  '/me',
  employerMiddleware,
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      status: Joi.string().valid('draft', 'published', 'archived'),
    });

    const query = await schema.validateAsync(req.query);

    const possibilities = await getMyPossibilities(req.user.id, query);
    res.send(possibilities);
  }),
);

routerPossibility.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const possibility = await getPossibility(req.params.id, req.user?.id);
    res.send(possibility);
  }),
);

routerPossibility.delete(
  '/:id',
  companyVerificationMiddleware,
  asyncHandler(async (req, res) => {
    const result = await deletePossibility(req.user.id, req.params.id);
    res.send(result);
  }),
);

routerPossibility.patch(
  '/:id',
  companyVerificationMiddleware,
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      title: Joi.string().optional(),
      description: Joi.string().optional(),
      type: Joi.string().valid('internship', 'vacancy', 'mentorship', 'event').optional(),
      format: Joi.string().valid('office', 'remote', 'hybrid').optional(),
      city: Joi.string().optional(),
      address: Joi.string().optional(),
      salary: Joi.number().optional(),
      date: Joi.date().optional(),
      tagIds: Joi.array().items(Joi.string().uuid()).optional(),
    });

    await schema.validateAsync(req.body);

    const result = await updatePossibility(req.user.id, req.params.id, req.body);
    res.send(result);
  }),
);

module.exports = routerPossibility;