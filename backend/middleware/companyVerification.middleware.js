const createError = require('http-errors');
const { Companies } = require('../db/models');

async function companyVerificationMiddleware(req, res, next) {
  const company = await Companies.findOne({
    where: { userId: req.user.id }
  })

  if (!company) {
    throw createError(404, 'Компания не найдена');
  }

  if (company.verification_status !== 'approved') {
    throw createError(403, 'Только для верифицированных компаний');
  }
  next();
}

module.exports = companyVerificationMiddleware;