const asyncHandler = require("express-async-handler");
const Joi = require("joi");
const { getPossibilities } = require("../controllers/possibilities.controller");
const routerGuest = require('express').Router();

routerGuest.get(
  '/possibility',
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      limit: Joi.number().min(1).max(100).default(20),
      offset: Joi.number().min(0).default(0),

      type: Joi.string().valid('internship', 'vacancy', 'mentorship', 'event'),
      format: Joi.string().valid('office', 'remote', 'hybrid'),
      city: Joi.string(),

      salaryFrom: Joi.number(),
      salaryTo: Joi.number(),

      tags: Joi.string(),
      search: Joi.string(),
    });

    const query = await schema.validateAsync(req.query);

    const possibilities = await getPossibilities(
      query,
      req.user?.id
    );

    res.send(possibilities);
  }),
);

module.exports = routerGuest;