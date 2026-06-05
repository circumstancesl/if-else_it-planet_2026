const auth = require('./auth.controller');
const token = require('./tokens.controller');
const user = require('./users.controller');
const possibility = require('./possibilities.controller');
const tag = require('./tags.controller');
const favorite = require('./favorites.controller');
const response = require('./responses.controller');
const admin = require('./admin.controller');
const curator = require('./curator.controller');
const connection = require('./connections.controller');

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
  addFavorite: favorite.addFavorite,
  getFavorites: favorite.getFavorites,
  removeFavorite: favorite.removeFavorite,
  updateResponseStatus: response.updateResponseStatus,
  getMyResponses: response.getMyResponses,
  getCompanyResponses: response.getResponsesForPossibility(),
  applyToPossibility: response.applyToPossibility,
  createCurator: admin.createCurator,
  deleteCurator: admin.deleteCurator,
  getCurators: admin.getCurators,
  getCompanies: curator.getCompanies,
  updateCompanyStatus: curator.updateCompanyStatus,
  getRequests: connection.getRequests,
  getFriends: connection.getFriends,
  rejectRequest: connection.rejectRequest,
  acceptRequest: connection.acceptRequest,
  sendRequest: connection.sendRequest,
  getSuggestedFriends: user.getSuggestedFriends,
  getCompanyPossibilities: possibility.getCompanyPossibilities,
  removeFriend: connection.removeFriend,
  getSummaryCandidate: response.getSummaryCandidate,
  verifyCompany: curator.verifyCompany,
}