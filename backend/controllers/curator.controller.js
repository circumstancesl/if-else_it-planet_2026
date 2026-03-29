const { Companies, Responses, Possibilities} = require('../db/models');
const createError = require("http-errors");

async function getCompanies(status) {
  let where = {};

  if (status) {
    where.verification_status = status;
  }

  const companies = await Companies.findAll({
    where,
  });

  return companies;
}

async function updateCompanyStatus(companyId, status) {
  const company = await Companies.findOne({
    where: { id: companyId }
  });

  if (!company) {
    throw createError(404, 'Компания не найдена');
  }

  company.verification_status = status;
  await company.save();

  return company;
}

module.exports = {
  getCompanies,
  updateCompanyStatus,
};