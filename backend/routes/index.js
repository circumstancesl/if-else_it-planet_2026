const createError = require('http-errors');
const { BaseError } = require('sequelize');
const router = require('express').Router();
const routerAuth = require('./auth.router');
const routerToken = require('./tokens.router');
const routerUser = require('./users.router');
const routerPossibility = require('./possibilities.router');
const routerTag =  require('./tags.router');
const routerFavorite =  require('./favorites.router');
const routerResponse = require('./responses.router');
const routerAdmin =  require('./admin.router');
const routerCurator =  require('./curator.router');
const routerChat =  require('./chat.router');

const authenticationMiddleware = require('../middleware/authentication.middleware');

router.use('/auth', routerAuth);
router.use('/api', authenticationMiddleware);
router.use('/api', routerToken);
router.use('/api/users', routerUser);
router.use('/api/possibility', routerPossibility);
router.use('/api/tag', routerTag);
router.use('/api/favorite', routerFavorite);
router.use('/api/response', routerResponse);
router.use('/api/admin', routerAdmin);
router.use('/api/curator', routerCurator);
router.use('/api/chat', routerChat);

router.use((req, res, next) => {
  next(createError(404, 'Page not Found'));
});

router.use(async (error, req, res, next) => {
  if (error instanceof BaseError) {
    console.log(error);
    error.message = 'Произошла ошибка, обратитесь, пожалуйста, в поддержку';
    error.status = 400;
  }
  res.status(error.status || 400);

  if (error.status !== 401) {
    if (error.errors) {
      return res.json({
        message: error.message,
        errors: error.errors,
      });
    }
    res.json({
      message: error.message,
    });
  } else {
    res.json({
      messageLogin: error.messageLogin,
      messagePass: error.messagePass,
    });
  }
  res.end();
});

module.exports = router;
