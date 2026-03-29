const createError = require('http-errors');
const { Tags } = require('../db/models');
const { Op } = require('sequelize');

async function createTag(name, type) {
  const existingTag = await Tags.findOne({
    where: { name },
  });

  if (existingTag) {
    throw createError(400, 'Тег уже существует');
  }

  return await Tags.create({ name, type });
}

async function getTags(query) {
  const where = {};

  if (query.type) {
    where.type = query.type;
  }

  if (query.search) {
    where.name = {
      [Op.iLike]: `%${query.search}%`,
    };
  }

  const tags = await Tags.findAll({
    where,
    order: [['name', 'ASC']],
    limit: 10,
  });

  return tags;
}

module.exports = { createTag, getTags };