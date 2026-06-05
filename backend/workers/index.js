const express = require('express');
const httpLib = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('../db/models');
const initSocket = require('../socketIo');

const rootRouter = require('../routes');
const { join } = require("node:path");

module.exports = (() => {
  const app = express();
  const http = httpLib.createServer(app);
  const PORT = process.env.PORT || 8080;
  initSocket(http);

  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: '200mb' }));
  app.use(cookieParser());
  app.use('/uploads', express.static(join(__dirname, '../uploads')));
  app.use(rootRouter);

  db.connect().catch((e) => {
    console.log(e);
    throw new Error(e);
  });

  http.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });

  return app;
})();
