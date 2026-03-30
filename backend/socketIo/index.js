const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config.json');

const registerHandlers = require('./handlers');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Нет токена'));
      }

      const payload = jwt.verify(token, config.secret);

      socket.user = {
        id: payload.id,
      };

      next();
    } catch (err) {
      next(new Error('Неверный токен'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.user.id);

    registerHandlers(io, socket);
  });

  return io;
}

module.exports = initSocket;