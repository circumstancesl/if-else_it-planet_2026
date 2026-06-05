const routerConnection = require('express').Router();
const asyncHandler = require('express-async-handler');

const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getFriends,
  getRequests,
  removeFriend,
} = require('../controllers/connections.controller');

routerConnection.post('/:userId', asyncHandler(async (req, res) => {
  const result = await sendRequest(req.user.id, req.params.userId);
  res.send(result);
}));

routerConnection.patch('/:id/accept', asyncHandler(async (req, res) => {
  const result = await acceptRequest(req.user.id, req.params.id);
  res.send(result);
}));

routerConnection.patch('/:id/reject', asyncHandler(async (req, res) => {
  const result = await rejectRequest(req.user.id, req.params.id);
  res.send(result);
}));

routerConnection.get('/', asyncHandler(async (req, res) => {
  const result = await getFriends(req.user.id);
  res.send(result);
}));

routerConnection.get('/requests', asyncHandler(async (req, res) => {
  const result = await getRequests(req.user.id);
  res.send(result);
}));

routerConnection.delete(
  '/:friendId',
  asyncHandler(async (req, res) => {
    const result = await removeFriend(req.user.id, req.params.friendId);
    res.send(result);
  }),
);

module.exports = routerConnection;