const createError = require('http-errors');
const { Favorites, Possibilities, Tags } = require('../db/models');

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
    order: [['createdAt', 'DESC']],
  });

  const result = [];

  for (const fav of favorites) {
    if (fav.type === 'possibility') {
      const item = await Possibilities.findByPk(fav.itemId, {
        include: [{ model: Tags }],
      });

      if (item) result.push({ type: 'possibility', item });
    }

    if (fav.type === 'company') {
      const item = await Companies.findByPk(fav.itemId);

      if (item) result.push({ type: 'company', item });
    }
  }

  return result;
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
};