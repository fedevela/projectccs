'use strict';
const message = require('./message');
const servicioRegistroVentas = require('./servicioRegistroVentas');
const authentication = require('./authentication');
const user = require('./user');

module.exports = function() {
  const app = this;


  app.configure(authentication);
  app.configure(user);
  app.configure(servicioRegistroVentas);
  app.configure(message);
};
