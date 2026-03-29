const routerAdmin = require('express').Router();
const asyncHandler = require('express-async-handler');
const {
  createCurator,
  deleteCurator,
  getCurators,
} = require('../controllers/admin.controller');
const adminMiddleware = require("../middleware/admin.middleware");
const { registerSchema } = require("../joiDefaultSchemas");

routerAdmin.post(
  '/',
  adminMiddleware,
  asyncHandler(async (req, res) => {
    await registerSchema.validateAsync(req.body);

    res.send(await createCurator(req.body.email, req.body.password, req.body.name));
  }),
);

routerAdmin.delete(
  '/:id',
  adminMiddleware,
  asyncHandler(async (req, res) => {
    res.send(await deleteCurator(req.params.id));
  }),
);

routerAdmin.get(
  '/',
  adminMiddleware,
  asyncHandler(async (req, res) => {
    res.send(await getCurators());
  }),
);

module.exports = routerAdmin;