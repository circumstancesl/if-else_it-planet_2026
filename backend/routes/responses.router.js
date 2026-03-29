const routerResponse = require('express').Router();
const asyncHandler = require('express-async-handler');
const Joi = require('joi');

const candidateMiddleware = require('../middleware/candidate.middleware');
const employerMiddleware = require('../middleware/employer.middleware');

const {
  applyToPossibility,
  getMyResponses,
  getResponsesForPossibility,
  updateResponseStatus,
} = require('../controllers/responses.controller');

routerResponse.post(
  '/',
  candidateMiddleware,
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      possibilityId: Joi.string().uuid().required(),
    });

    const body = await schema.validateAsync(req.body);

    const result = await applyToPossibility(
      req.user.id,
      body.possibilityId,
    );

    res.send(result);
  }),
);

routerResponse.get(
  '/my',
  candidateMiddleware,
  asyncHandler(async (req, res) => {
    const { status } = req.query;

    const result = await getMyResponses(req.user.id, status);

    res.send(result);
  }),
);

routerResponse.get(
  '/:possibilityId',
  employerMiddleware,
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      possibilityId: Joi.string().uuid().required(),
    });

    const { possibilityId } = await schema.validateAsync(req.params);

    const result = await getResponsesForPossibility(req.user.id, possibilityId);
    res.send(result);
  }),
);

routerResponse.patch(
  '/:id',
  employerMiddleware,
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      status: Joi.string()
        .valid('pending', 'accepted', 'rejected', 'reserve')
        .required(),
    });

    const body = await schema.validateAsync(req.body);

    const result = await updateResponseStatus(
      req.user.id,
      req.params.id,
      body.status,
    );

    res.send(result);
  }),
);

module.exports = routerResponse;