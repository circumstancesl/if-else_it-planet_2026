const createError = require('http-errors');
const { Users, CandidateProfiles, Companies } = require('../db/models');
const isValidInn = require('../utils/validate.js');

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
  });

  if (!candidateProfile) {
    throw createError(404, 'Профиль кандидата не найден');
  }

  return candidateProfile
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

  if (data.fullName !== undefined) {
    profile.fullName = data.fullName;
  }

  if (data.university !== undefined) {
    profile.university = data.university;
  }

  if (data.graduationYear !== undefined) {
    profile.graduationYear = data.graduationYear;
  }

  if (data.about !== undefined) {
    profile.about = data.about;
  }

  if (data.jobTitle !== undefined) {
    profile.jobTitle = data.jobTitle;
  }

  if (data.resumeURL !== undefined) {
    profile.resumeURL = data.resumeURL;
  }

  if (data.profileVisible !== undefined) {
    profile.profileVisible = data.profileVisible;
  }

  if (data.applicationsVisible !== undefined) {
    profile.applicationsVisible = data.applicationsVisible;
  }

  await profile.save();

  return profile;
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

module.exports = {
  getUserProfile,
  updateCandidateProfile,
  getCandidates,
  getMyProfile,
  getCompanyProfile,
  updateCompanyProfile,
};