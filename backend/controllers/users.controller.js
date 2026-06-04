const createError = require('http-errors');
const { Users, CandidateProfiles, Companies, Connections, Tags } = require('../db/models');
const isValidInn = require('../utils/validate.js');
const { literal, Op} = require("sequelize");

async function getMyProfile(userId) {
  const user = await Users.findOne({
    where: { id: userId },
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    throw createError(404, 'Пользователь не найден');
  }

  if (user.role === 'candidate') {
    const candidateProfile = await CandidateProfiles.findOne({
      where: { userId },
      include: [
        {
          model: Tags,
          through: { attributes: [] },
          attributes: ['id', 'name', 'type'],
        }
      ]
    });

    if (!candidateProfile) {
      throw createError(404, 'Профиль кандидата не найден');
    }

    return {
      role: 'candidate',
      profile: candidateProfile,
      email: user.email,
    };
  } else if (user.role === 'employer') {
    const company = await Companies.findOne({
      where: { userId },
    });

    if (!company) {
      throw createError(404, 'Профиль работодателя не найден');
    }

    return {
      role: 'employer',
      profile: company,
      email: user.email,
    };
  }
}

async function getUserProfile(userId) {
  const candidateProfile = await CandidateProfiles.findOne({
    where: { userId, profileVisible: true },
    include: [
      {
        model: Tags,
        through: { attributes: [] },
        attributes: ['id', 'name', 'type'],
      }
    ]
  });

  if (!candidateProfile) {
    throw createError(404, 'Профиль кандидата не найден');
  }

  return candidateProfile;
}

async function getCandidates(limit = 20, offset = 0) {
  const candidates = await CandidateProfiles.findAll({
    where: { profileVisible: true },
    attributes: ['userId', 'fullName', 'jobTitle'],
    limit: limit,
    offset: offset,
  })

  return candidates;
}

async function updateCandidateProfile(userId, data) {
  const profile = await CandidateProfiles.findOne({
    where: { userId },
  });

  if (!profile) {
    throw createError(404, 'Профиль кандидата не найден');
  }

  const { tagIds, ...updateData } = data;

  if (Object.keys(updateData).length > 0) {
    await profile.update(updateData);
  }

  if (tagIds !== undefined) {
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      await profile.setTags([]);
    } else {
      const tags = await Tags.findAll({
        where: { id: { [Op.in]: tagIds } },
      });

      if (tags.length !== tagIds.length) {
        throw createError(400, 'Некоторые теги не существуют');
      }

      await profile.setTags(tags);
    }
  }

  return await CandidateProfiles.findOne({
    where: { userId },
    include: [
      {
        model: Tags,
        through: { attributes: [] },
        attributes: ['id', 'name', 'type'],
      }
    ]
  });
}

async function getCompanyProfile(id) {
  const companyProfile = await Companies.findOne({
    where: { id },
  });

  if (!companyProfile) {
    throw createError(404, 'Компания не найдена');
  }

  return companyProfile
}

async function updateCompanyProfile(userId, data) {
  const company = await Companies.findOne({
    where: { userId },
  });

  if (!company) {
    throw createError(404, 'Профиль компании не найден');
  }

  if (data.name !== undefined) {
    company.name = data.name;
  }

  if (data.description !== undefined) {
    company.description = data.description;
  }

  if (data.industry !== undefined) {
    company.industry = data.industry;
  }

  if (data.websiteURL !== undefined) {
    company.websiteURL = data.websiteURL;
  }

  if (data.logoUrl !== undefined) {
    company.logoUrl = data.logoUrl;
  }

  if (data.inn !== undefined) {
    const cleanInn = String(data.inn).replace(/\D/g, '');

    if (cleanInn.length !== 10 && cleanInn.length !== 12) {
      throw createError(400, 'ИНН должен содержать ровно 10 или 12 цифр');
    }

    if (!isValidInn(cleanInn)) {
      throw createError(400, 'Неверный ИНН: ошибка в контрольной сумме');
    }

    company.inn = cleanInn;
  }


  await company.save();

  return company;
}

async function getSuggestedFriends(currentUserId, limit = 20, offset = 0) {
  if (!currentUserId) {
    throw createError(401, 'Требуется авторизация');
  }

  const connections = await Connections.findAll({
    where: {
      [Op.or]: [
        { requesterId: currentUserId },
        { receiverId: currentUserId }
      ],
      status: { [Op.in]: ['pending', 'accepted'] }
    },
    attributes: ['requesterId', 'receiverId'],
    raw: true
  });

  const excludedIds = new Set([currentUserId]);

  connections.forEach(conn => {
    excludedIds.add(conn.requesterId);
    excludedIds.add(conn.receiverId);
  });

  const candidates = await CandidateProfiles.findAll({
    where: {
      profileVisible: true,
      userId: { [Op.notIn]: Array.from(excludedIds) }
    },
    attributes: [
      'userId',
      'fullName',
      'jobTitle',
      [literal(`(
        SELECT COUNT(*)
        FROM (
          SELECT CASE
            WHEN "requesterId" = '${currentUserId}' THEN "receiverId"
            ELSE "requesterId"
          END AS "friendId"
          FROM "Connections"
          WHERE "status" = 'accepted'
            AND ("requesterId" = '${currentUserId}' OR "receiverId" = '${currentUserId}')
        ) AS "myFriends"
        JOIN "Connections" AS "targetConn" ON
          "targetConn"."status" = 'accepted'
          AND (
            ("targetConn"."requesterId" = "myFriends"."friendId" AND "targetConn"."receiverId" = "CandidateProfiles"."userId")
            OR
            ("targetConn"."receiverId" = "myFriends"."friendId" AND "targetConn"."requesterId" = "CandidateProfiles"."userId")
          )
      )`), 'mutualFriendsCount']
    ],
    order: [
      [literal('"mutualFriendsCount"'), 'DESC'],
      ['userId', 'ASC']
    ],
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  });

  return candidates.map(c => {
    const plain = c.toJSON();
    plain.mutualFriendsCount = parseInt(plain.mutualFriendsCount, 10) || 0;
    return plain;
  });
}

module.exports = {
  getUserProfile,
  updateCandidateProfile,
  getCandidates,
  getMyProfile,
  getCompanyProfile,
  updateCompanyProfile,
  getSuggestedFriends
};