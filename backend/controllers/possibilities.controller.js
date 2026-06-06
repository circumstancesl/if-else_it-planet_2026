const { Companies, Possibilities, Tags, Favorites} = require('../db/models');
const createError = require('http-errors');
const { Op } = require('sequelize');

async function createPossibility(userId, data) {
  const {
    tagIds,
    ...possibilityData
  } = data;

  const company = await Companies.findOne({
    where: { userId: userId },
  });

  if (!company) {
    throw createError(403, 'Компания не найдена');
  }

  const possibility = await Possibilities.create({
    ...possibilityData,
    companyId: company.id,
    status: 'draft',
  });

  const tags = await Tags.findAll({
    where: {
      id: tagIds,
    },
  });

  if (tags.length !== tagIds.length) {
    throw createError(400, 'Некоторые теги не существуют');
  }

  await possibility.setTags(tags);
  await possibility.update({ status: 'published' });

  const result = await Possibilities.findByPk(possibility.id, {
    include: [{ model: Tags }],
  });

  return result;
}

async function getPossibilities(query, userId) {
  const {
    limit,
    offset,
    type,
    format,
    city,
    salaryFrom,
    salaryTo,
    tags,
    search,
  } = query;

  const where = {
    status: 'published',
  };

  if (type) {
    where.type = type;
  }

  if (format) {
    where.format = format;
  }

  if (city) {
    where.city = {
      [Op.iLike]: `%${city}%`,
    };
  }

  if (salaryFrom || salaryTo) {
    where.salary = {};

    if (salaryFrom) {
      where.salary[Op.gte] = salaryFrom;
    }

    if (salaryTo) {
      where.salary[Op.lte] = salaryTo;
    }
  }

  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const include = [
    {
      model: Tags,
      through: { attributes: [] },
    },
    {
      model: Companies,
      attributes: ['id', 'name', 'logoUrl'],
      required: false,
    }
  ];

  if (tags) {
    const tagIds = tags.split(',');

    include[0].where = {
      id: {
        [Op.in]: tagIds,
      },
    };
  }

  const possibilities = await Possibilities.findAll({
    where,
    include,
    order: [['createdAt', 'DESC']],
    limit: +limit,
    offset: +offset,
    distinct: true,
  });

  let favoriteIds = [];

  if (userId) {
    const favorites = await Favorites.findAll({
      where: {
        userId,
        type: 'possibility',
      },
      attributes: ['itemId'],
    });

    favoriteIds = favorites.map(f => f.itemId);
  }

  return possibilities.map(p => ({
    ...p.toJSON(),
    isFavorite: favoriteIds.includes(p.id),
  }));
}

async function getPossibility(id, userId) {
  const possibility = await Possibilities.findOne({
    where: { id },
    include: [
      {
        model: Companies,
        attributes: ['id', 'name', 'description', 'websiteURL', 'industry']
      },
      {
        model: Tags,
        through: { attributes: [] },
        attributes: ['id', 'name', 'type']
      }
    ]
  });

  if (!possibility) {
    throw createError(404, 'Событие не найдено');
  }

  let isFavorite = false;

  if (userId) {
    const favorite = await Favorites.findOne({
      where: {
        userId,
        type: 'possibility',
        itemId: id,
      },
    });

    isFavorite = !!favorite;
  }

  return {
    id: possibility.id,
    title: possibility.title,
    description: possibility.description,
    type: possibility.type,
    format: possibility.format,
    city: possibility.city,
    address: possibility.address,
    latitude: possibility.latitude,
    longitude: possibility.longitude,
    salary: possibility.salary,
    createdAt: possibility.createdAt,
    date: possibility.date,

    isFavorite,

    company: possibility.Company ? {
      id: possibility.Company.id,
      name: possibility.Company.name,
      description: possibility.Company.description,
      websiteURL: possibility.Company.websiteURL,
      industry: possibility.Company.industry,
    } : null,

    tags: possibility.Tags?.map(tag => ({
      id: tag.id,
      name: tag.name,
      type: tag.type
    })) || []
  };
}

async function getMyPossibilities(userId, query = {}) {
  const company = await Companies.findOne({
    where: { userId },
  });

  if (!company) {
    throw createError(404, 'Компания не найдена');
  }

  const where = {
    companyId: company.id,
  };

  if (query.status) {
    where.status = query.status;
  }

  const possibilities = await Possibilities.findAll({
    where,
    include: [
      {
        model: Tags,
        through: { attributes: [] },
        attributes: ['id', 'name', 'type']
      }
    ],
    order: [['createdAt', 'DESC']],
  });

  if (!possibilities || possibilities.length === 0) {
    throw createError(404, 'События не найдены');
  }

  return possibilities;
}

async function updatePossibility(userId, possibilityId, data) {
  const possibility = await Possibilities.findByPk(possibilityId);

  if (!possibility) {
    throw createError(404, 'Возможность не найдена');
  }

  const company = await Companies.findOne({
    where: { userId },
  });

  if (!company || company.id !== possibility.companyId) {
    throw createError(403, 'Нет доступа');
  }

  const { tagIds, ...updateData } = data;

  await possibility.update(updateData);

  if (tagIds) {
    const tags = await Tags.findAll({
      where: { id: tagIds },
    });

    if (tags.length !== tagIds.length) {
      throw createError(400, 'Некоторые теги не существуют');
    }

    await possibility.setTags(tags);
  }

  return await Possibilities.findByPk(possibility.id, {
    include: [{ model: Tags }],
  });
}

async function deletePossibility(userId, possibilityId) {
  const possibility = await Possibilities.findByPk(possibilityId);

  if (!possibility) {
    throw createError(404, 'Возможность не найдена');
  }

  const company = await Companies.findOne({
    where: { userId },
  });

  if (!company || company.id !== possibility.companyId) {
    throw createError(403, 'Нет доступа');
  }

  await possibility.destroy();

  return { message: 'Удалено успешно' };
}

async function getCompanyPossibilities(companyId) {
  const possibilities = await Possibilities.findAll({
    where: {
      companyId,
      status: 'published',
    },
    include: [
      {
        model: Tags,
        through: { attributes: [] },
        attributes: ['id', 'name', 'type'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return possibilities.map(p => p.toJSON());
}

module.exports = {
  createPossibility,
  getPossibilities,
  getPossibility,
  getMyPossibilities,
  deletePossibility,
  updatePossibility,
  getCompanyPossibilities
}