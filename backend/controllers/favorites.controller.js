const createError = require('http-errors');
const { Favorites, Possibilities, Tags, Companies } = require('../db/models');
const { Op } = require('sequelize');

async function addFavorite(userId, type, itemId) {
  const existing = await Favorites.findOne({
    where: { userId, type, itemId },
  });

  if (existing) {
    throw createError(400, 'Уже в избранном');
  }

  await Favorites.create({ userId, type, itemId });

  return { message: 'Добавлено в избранное' };
}

async function removeFavorite(userId, itemId) {
  const favorite = await Favorites.findOne({
    where: {
      userId,
      itemId,
    },
  });

  if (!favorite) {
    throw createError(404, 'Не найдено в избранном');
  }

  await favorite.destroy();

  return { message: 'Удалено из избранного' };
}

async function getFavorites(userId) {
  const favorites = await Favorites.findAll({
    where: { userId },
    attributes: ['type', 'itemId'],
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  const possibilityIds = favorites.filter(f => f.type === 'possibility').map(f => f.itemId);
  const companyIds = favorites.filter(f => f.type === 'company').map(f => f.itemId);

  const possibilities = possibilityIds.length > 0
    ? await Possibilities.findAll({
      where: { id: { [Op.in]: possibilityIds } },
      include: [
        { model: Tags, through: { attributes: [] }, attributes: ['id', 'name', 'type'] },
        { model: Companies, attributes: ['id', 'name', 'logoUrl', 'verification_status'], required: false },
      ],
      raw: true,
      nest: true,
    })
    : [];

  const companies = companyIds.length > 0
    ? await Companies.findAll({
      where: { id: { [Op.in]: companyIds } },
      attributes: ['id', 'name', 'logoUrl', 'description'],
      raw: true,
    })
    : [];

  const possibilitiesMap = new Map(possibilities.map(p => [p.id, p]));
  const companiesMap = new Map(companies.map(c => [c.id, c]));

  return favorites.map(fav => {
    if (fav.type === 'possibility') {
      return { type: 'possibility', item: possibilitiesMap.get(fav.itemId) || null };
    }
    if (fav.type === 'company') {
      return { type: 'company', item: companiesMap.get(fav.itemId) || null };
    }
    return null;
  }).filter(Boolean);
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
};