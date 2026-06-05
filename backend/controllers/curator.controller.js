const { Companies } = require('../db/models');
const createError = require("http-errors");
const axios = require("axios");

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

async function verifyCompany(companyId) {
  const company = await Companies.findOne({
    where: { id: companyId },
    attributes: ['id', 'name', 'inn']
  });

  if (!company) {
    throw createError(404, 'Компания не найдена');
  }

  if (!company.name || !company.inn) {
    throw createError(400, 'Для проверки у компании должны быть заполнены название и ИНН');
  }

  const message = `Проверь контрагента. Название Фирмы: ${company.name}. ИНН: ${company.inn}. 
  Коротко напиши на основе полученных данных о компании. Напиши ОБЫЧНЫМ ТЕКСТОМ. Больше ничего не пиши`;

  try {
    const response = await axios({
      method: 'POST',
      url: process.env.URLINN,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.APIKEY}`,
        'X-API-KEY': process.env.APIKEY
      },
      data: {
        message: message
      },
    });

    return response.data;

  } catch (error) {
    throw createError(
      error.message
    );
  }
}

module.exports = {
  getCompanies,
  updateCompanyStatus,
  verifyCompany,
};