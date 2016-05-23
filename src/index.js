'use strict';

const app = require('./app');
const port = app.get('port');

var thePort = process.env.PORT || port;

const server = app.listen(thePort);

server.on('listening', () =>
  console.log(`Feathers application started on ${app.get('host')}:${thePort}`)
);
