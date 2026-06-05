const createError = require('http-errors');
const { Responses, Possibilities, Companies, Users, Tags, CandidateProfiles } = require('../db/models');
require('dotenv').config();
const axios = require('axios');

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

async function getMyResponses(userId, status, completed) {
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
          'companyId',
          'date',
          'status',
        ],
        include: [
          {
            model: Tags,
            through: { attributes: [] },
            attributes: ['id', 'name', 'type'],
          },
          {
            model: Companies,
            attributes: ['id', 'name', 'userId'],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  const today = new Date();

  let result = responses.map(r => {
    const possibility = r.Possibility;

    const isArchived = possibility.status === 'archived';
    const isDatePassed = possibility.date ? new Date(possibility.date) < today : false;
    const isCompleted = isArchived || isDatePassed;

    return {
      responseId: r.id,
      status: r.status,
      possibilityId: possibility.id,
      title: possibility.title,
      description: possibility.description,
      salary: possibility.salary,
      address: possibility.address,
      city: possibility.city,
      date: possibility.date,
      isCompleted,
      tags: possibility.Tags,
      companyId: possibility.companyId,
      companyName: possibility.Company.name,
      companyUserId: possibility.Company.userId,
    };
  });

  if (completed !== undefined) {
    result = result.filter(item => item.isCompleted === completed);
  }

  return result;
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

async function getSummaryCandidate(userId) {
  try {
    const profile = await CandidateProfiles.findOne({
      where: { userId },
      attributes: ['university', 'graduationYear', 'about', 'resumeURL', 'jobTitle'],
      include: [
        {
          model: Tags,
          through: { attributes: [] },
          attributes: ['name', 'type'],
        }
      ]
    });

    if (!profile) {
      return { message: 'Профиль кандидата не найден', status: 'error' };
    }

    const tagsString = profile.Tags && profile.Tags.length > 0
      ? profile.Tags.map(t => `${t.name} (${t.type})`).join(', ')
      : 'Не указаны';

    const prompt = `Ты — опытный HR-рекрутер и технический специалист. Проанализируй профиль кандидата и составь краткое, профессиональное резюме (2-3 предложения) о его потенциале и соответствии рынку.

анные кандидата:
- Должность: ${profile.jobTitle || 'Не указана'}
- Университет: ${profile.university || 'Не указан'}
- Год выпуска: ${profile.graduationYear || 'Не указан'}
- О себе (опыт, проекты): ${profile.about || 'Не указано'}
- Ссылка на резюме: ${profile.resumeURL || 'Не предоставлена'}
- Навыки и теги: ${tagsString}

ПРАВИЛА ОЦЕНКИ (строго следуй им):
1. Если у кандидата указаны только 1-3 тега, но при этом ОТСУТСТВУЕТ описание опыта ("О себе"), нет ссылки на резюме и нет данных об образовании — это НЕПОЛНЫЙ и НЕКАЧЕСТВЕННЫЙ профиль. Теги без описания опыта не являются доказательством квалификации.
2. "Хороший кандидат" — это тот, кто предоставил развернутое описание своего опыта/проектов ИЛИ приложил резюме, а его теги подкреплены этим описанием.
3. Напиши краткий, жесткий и объективный вердикт (2-3 предложения), указывая на конкретные пробелы в профиле.

СТРОГОЕ ТРЕБОВАНИЕ К ФОРМАТУ ОТВЕТА:
1. Напиши краткое описание.
2. В самом конце ответа, с новой строки, ты ОБЯЗАТЕЛЬНО должен написать ровно одну из двух фраз (без кавычек, без точек и дополнительных слов):
хороший кандидат
ИЛИ
плохой кандидат`;

    const response = await axios.post(
      process.env.URL,
      {
        model: 'gemma4:e4b',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        options: {
          temperature: 0.3
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    const message = response.data.message?.content
      || response.data.choices?.[0]?.message?.content
      || 'Не удалось получить ответ от модели';

    return { message, status: 'success' };

  } catch (error) {
    console.error('Ошибка при генерации саммари кандидата:', error.message);

    return {
      message: error.response?.data?.error?.message || error.message || 'Ошибка сервера при обращении к LLM',
      status: 'error'
    };
  }
}

module.exports = {
  applyToPossibility,
  updateResponseStatus,
  getMyResponses,
  getResponsesForPossibility,
  getSummaryCandidate,
}