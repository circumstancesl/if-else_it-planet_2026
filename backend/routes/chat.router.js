const routerChat = require('express').Router();
const asyncHandler = require('express-async-handler');
const Joi = require('joi');

const {
  createChat,
  getMyChats,
  getChatMessages,
} = require('../controllers/chat.controller');

routerChat.post(
  '/',
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      userId: Joi.string().uuid().required(),
    });

    const body = await schema.validateAsync(req.body);

    const result = await createChat(req.user.id, body.userId);
    res.send(result);
  }),
);

routerChat.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await getMyChats(req.user.id);
    res.send(result);
  }),
);

routerChat.get(
  '/:chatId',
  asyncHandler(async (req, res) => {
    const schema = Joi.object({
      chatId: Joi.string().uuid().required(),
    });

    const { chatId } = await schema.validateAsync(req.params);

    const result = await getChatMessages(req.user.id, chatId);
    res.send(result);
  }),
);

module.exports = routerChat;