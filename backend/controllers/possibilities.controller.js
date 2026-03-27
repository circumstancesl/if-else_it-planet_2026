const { Companies, Possibilities } = require('../db/models');
const createError = require('http-errors');

async function createPossibility(userId, data) {
  const company = await Companies.findOne({
    where: { userId: userId },
  });

  if (!company) {
    throw createError(403, 'Компания не найдена');
  }

  return await Possibilities.create({
    ...data,
    companyId: company.id,
    status: 'draft',
  });
}

async function updatePossibility(userId, activityId, data) {
  const activity = await Activities.findByPk(activityId);

  if (!activity) {
    throw createError(404, 'Активность не найдена');
  }

  // проверяем владельца
  const company = await Companies.findOne({
    where: { id: activity.company_id },
  });

  if (!company || company.user_id !== userId) {
    throw createError(403, 'Нет доступа');
  }

  await activity.update(data);

  return activity;
}

async function deletePossibility(userId, activityId) {
  const activity = await Activities.findByPk(activityId);

  if (!activity) {
    throw createError(404, 'Активность не найдена');
  }

  const company = await Companies.findOne({
    where: { id: activity.company_id },
  });

  if (!company || company.user_id !== userId) {
    throw createError(403, 'Нет доступа');
  }

  await activity.destroy();
}

module.exports = {
  createPossibility,
}