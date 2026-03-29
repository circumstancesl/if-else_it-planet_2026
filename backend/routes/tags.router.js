const routerTag = require('express').Router();
const asyncHandler = require('express-async-handler');
const Joi = require('joi');

const { createTag, getTags } = require('../controllers/tags.controller');
const employerOnly = require('../middleware/employer.middleware');

routerTag.post(
  '/',
  employerOnly,
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      name: Joi.string().min(1).max(50).required(),

      type: Joi.string()
        .valid('level', 'employmentType', 'technology')
        .required(),
    });

    await schema.validateAsync(req.body);

    const tag = await createTag(req.body.name, req.body.type);
    res.send(tag);
  }),
);

routerTag.get(
  '/',
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      type: Joi.string().valid('level', 'employmentType', 'technology'),
      search: Joi.string().min(1).optional(),
    });

    const query = await schema.validateAsync(req.query);

    const tags = await getTags(query);
    res.send(tags);
  }),
);

module.exports = routerTag;