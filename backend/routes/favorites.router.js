const routerFavorite = require('express').Router();
const asyncHandler = require('express-async-handler');
const Joi = require('joi');

const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require('../controllers/favorites.controller');

routerFavorite.post(
  '/',
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      type: Joi.string()
        .valid('possibility', 'company')
        .required(),

      itemId: Joi.string()
        .uuid()
        .required(),
    });

    const body = await schema.validateAsync(req.body);

    const result = await addFavorite(
      req.user.id,
      body.type,
      body.itemId,
    );

    res.send(result);
  }),
);

routerFavorite.delete(
  '/',
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      itemId: Joi.string()
        .uuid()
        .required(),
    });

    const body = await schema.validateAsync(req.body);

    const result = await removeFavorite(
      req.user.id,
      body.itemId,
    );

    res.send(result);
  }),
);

routerFavorite.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await getFavorites(req.user.id);
    res.send(result);
  }),
);

module.exports = routerFavorite;