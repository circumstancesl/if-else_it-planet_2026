const createError = require('http-errors');
const { Responses, Possibilities, Companies, Users, Tags, CandidateProfiles } = require('../db/models');

async function applyToPossibility(userId, possibilityId) {
  const possibility = await Possibilities.findByPk(possibilityId);

  // if (!possibility || possibility.status !== 'published') {
  //   throw createError(404, 'Возможность не найдена');
  // }

  if (!possibility) {
    throw createError(404, 'Возможность не найдена');
  }

  const existing = await Responses.findOne({
    where: {
      candidateId: userId,
      possibilityId,
    },
  });

  if (existing) {
    throw createError(400, 'Вы уже откликались');
  }

  return await Responses.create({
    candidateId: userId,
    possibilityId,
    status: 'pending',
  });
}

async function getMyResponses(userId, status) {
  const responses = await Responses.findAll({
    where: {
      candidateId: userId,
      ...(status && { status }),
    },
    include: [
      {
        model: Possibilities,
        attributes: [
          'id',
          'title',
          'description',
          'salary',
          'address',
          'city',
          'companyId'
        ],
        include: [
          {
            model: Tags,
            through: { attributes: [] },
            attributes: ['id', 'name', 'type'],
          },
          {
            model: Companies,
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return responses.map(r => {
    const possibility = r.Possibility;
    return {
      responseId: r.id,
      status: r.status,
      possibilityId: possibility.id,
      title: possibility.title,
      description: possibility.description,
      salary: possibility.salary,
      address: possibility.address,
      city: possibility.city,
      tags: possibility.Tags,
      companyId: possibility.companyId,
      companyName: possibility.Company.name,
    };
  });
}

async function getResponsesForPossibility(userId, possibilityId) {
  const company = await Companies.findOne({
    where: { userId },
  });

  if (!company) {
    throw createError(403, 'Компания не найдена');
  }

  const possibility = await Possibilities.findOne({
    where: {
      id: possibilityId,
      companyId: company.id,
    },
  });

  if (!possibility) {
    throw createError(403, 'Нет доступа к откликам для этого события');
  }

  const responses = await Responses.findAll({
    where: { possibilityId },
    include: [
      {
        model: Users,
        attributes: ['id', 'email'],
        include: [
          {
            model: CandidateProfiles,
            attributes: ['fullName'],
          }
        ]
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return responses.map((response) => {
    const plainResponse = response.get({
      plain: true
    });

    if (plainResponse.User && plainResponse.User.CandidateProfile) {
      plainResponse.User.fullName = plainResponse.User.CandidateProfile.fullName;
      delete plainResponse.User.CandidateProfile;
    }

    return plainResponse;
  });
}

async function updateResponseStatus(userId, responseId, status) {
  const response = await Responses.findByPk(responseId, {
    include: [{ model: Possibilities }],
  });

  if (!response) {
    throw createError(404, 'Отклик не найден');
  }

  const company = await Companies.findOne({
    where: { userId },
  });

  if (!company || response.Possibility.companyId !== company.id) {
    throw createError(403, 'Нет доступа');
  }

  response.status = status;
  await response.save();

  return response;
}

module.exports = {
  applyToPossibility,
  updateResponseStatus,
  getMyResponses,
  getResponsesForPossibility,
}