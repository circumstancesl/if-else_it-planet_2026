const createError = require('http-errors');
const { BaseError } = require('sequelize');
const router = require('express').Router();
const routerAuth = require('./auth.router');
const routerToken = require('./tokens.router');
const routerUser = require('./users.router');
const routerPossibility = require('./possibilities.router');

const authenticationMiddleware = require('../middleware/authentication.middleware');

router.use('/auth', routerAuth);
router.use('/api', authenticationMiddleware);
router.use('/api', routerToken);
router.use('/api/users', routerUser);
router.use('/api/possibility', routerPossibility);

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
