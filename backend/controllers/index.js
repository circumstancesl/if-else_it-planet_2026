const auth = require('./auth.controller');
const token = require('./tokens.controller');
const user = require('./users.controller');
const possibility = require('./possibilities.controller');
const tag = require('./tags.controller');

module.exports = {
  login: auth.login,
  registerCandidate: auth.registerCandidate,
  registerEmployer: auth.registerEmployer,
  rejectToken: token.rejectToken,
  getUserProfile: user.getUserProfile,
  getMyProfile: user.getMyProfile,
  getCandidates: user.getCandidates,
  updateCandidateProfile: user.updateCandidateProfile,
  createPossibility: possibility.createPossibility,
  getCompanyProfile: user.getCompanyProfile,
  updateCompanyProfile: user.updateCompanyProfile,
  createTag: tag.createTag,
  getTags: tag.getTags,
  getPossibilities: possibility.getPossibilities,
  getPossibility: possibility.getPossibility,
  getMyPossibilities: possibility.getMyPossibilities,
  deletePossibility: possibility.deletePossibility,
  updatePossibility: possibility.updatePossibility,
}