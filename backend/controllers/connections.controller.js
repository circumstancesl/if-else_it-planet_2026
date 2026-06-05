const createError = require('http-errors');
const { Users, Connections, CandidateProfiles, Tags } = require('../db/models');
const { Op } = require('sequelize');

async function sendRequest(currentUserId, targetUserId) {
  if (currentUserId === targetUserId) {
    throw createError(400, 'Нельзя добавить себя');
  }

  const existing = await Connections.findOne({
    where: {
      requesterId: currentUserId,
      receiverId: targetUserId,
    },
  });

  if (existing) {
    throw createError(400, 'Заявка уже отправлена');
  }

  return await Connections.create({
    requesterId: currentUserId,
    receiverId: targetUserId,
    status: 'pending',
  });
}

async function acceptRequest(userId, connectionId) {
  const connection = await Connections.findByPk(connectionId);

  if (!connection) {
    throw createError(404, 'Не найдено');
  }

  if (connection.receiverId !== userId) {
    throw createError(403, 'Нет доступа');
  }

  connection.status = 'accepted';
  await connection.save();

  return connection;
}

async function rejectRequest(userId, connectionId) {
  const connection = await Connections.findByPk(connectionId);

  if (!connection) {
    throw createError(404, 'Не найдено');
  }

  if (connection.receiverId !== userId) {
    throw createError(403, 'Нет доступа');
  }

  connection.status = 'rejected';
  await connection.save();

  return connection;
}

async function getFriends(userId) {
  const connections = await Connections.findAll({
    where: {
      status: 'accepted',
      [Op.or]: [
        { requesterId: userId },
        { receiverId: userId },
      ],
    },
    include: [
      {
        model: Users,
        as: 'Requester',
        attributes: ['id'],
        include: [
          {
            model: CandidateProfiles,
            attributes: ['fullName', 'jobTitle', 'logoUrl'],
            include: [
              {
                model: Tags,
                through: { attributes: [] },
                attributes: ['id', 'name', 'type'],
              },
            ],
          },
        ],
      },
      {
        model: Users,
        as: 'Receiver',
        attributes: ['id'],
        include: [
          {
            model: CandidateProfiles,
            attributes: ['fullName', 'jobTitle', 'logoUrl'],
            include: [
              {
                model: Tags,
                through: { attributes: [] },
                attributes: ['id', 'name', 'type'],
              },
            ],
          },
        ],
      },
    ],
  });

  return connections.map(c => {
    const user = c.requesterId === userId ? c.Receiver : c.Requester;

    const profile = user.CandidateProfile || {};

    return {
      id: user.id,
      fullName: profile.fullName || null,
      jobTitle: profile.jobTitle || null,
      logoUrl: profile.logoUrl || null,
      tags: profile.Tags || [],
    };
  });
}

async function getRequests(userId) {
  return await Connections.findAll({
    where: {
      receiverId: userId,
      status: 'pending',
    },
    include: [
      {
        model: Users,
        as: 'Requester',
        attributes: ['id', 'name'],
      },
    ],
  });
}

async function removeFriend(currentUserId, friendId) {
  if (!currentUserId) {
    throw createError(401, 'Требуется авторизация');
  }

  if (currentUserId === friendId) {
    throw createError(400, 'Нельзя удалить самого себя');
  }

  const connection = await Connections.findOne({
    where: {
      status: 'accepted',
      [Op.or]: [
        { requesterId: currentUserId, receiverId: friendId },
        { requesterId: friendId, receiverId: currentUserId }
      ]
    }
  });

  if (!connection) {
    throw createError(404, 'Дружба не найдена');
  }

  await connection.destroy();

  return { message: 'Друг успешно удалён' };
}

module.exports = {
  getRequests,
  getFriends,
  rejectRequest,
  acceptRequest,
  sendRequest,
  removeFriend,
}