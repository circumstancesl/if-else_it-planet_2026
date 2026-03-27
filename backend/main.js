const cluster = require('cluster');

const cpuCount = 1;

if (cluster.isMaster) {
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    cluster.fork();
  });

} else {
  require('./workers');
}
