const routerCurator = require('express').Router();
const asyncHandler = require("express-async-handler");
const Joi = require("joi");
const { getCompanies, updateCompanyStatus } = require("../controllers/curator.controller");
const curatorMiddleware = require("../middleware/curator.middleware");

routerCurator.get(
  '/',
  curatorMiddleware,
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      verification_status: Joi.string().valid('pending', 'approved', 'rejected'),
    });

    const { verification_status } = await schema.validateAsync(req.query);

    const companies = await getCompanies(verification_status);
    res.send(companies);
  }),
);

routerCurator.patch(
  '/:id',
  curatorMiddleware,
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      status: Joi.string()
        .valid('approved', 'pending', 'rejected')
        .required(),
    });

    const body = await schema.validateAsync(req.body);

    const result = await updateCompanyStatus(
      req.params.id,
      body.status,
    );

    res.send(result);
  }),
);

module.exports = routerCurator;