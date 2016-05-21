'use strict';

// src/services/servicioRegistroVentas/hooks/restrict-to-sender.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

const errors = require('feathers-errors');

module.exports = function(options) {
  return function(hook) {
    const servicioRegistroVentas = hook.app.service('servicioRegistroVentas');

    // First get the message that the user wants to access
    return servicioRegistroVentas.get(hook.id, hook.params).then(registroVenta => {
      // Throw a not authenticated error if the registroVenta and user id don't match
      if (registroVenta.sentBy._id !== hook.params.user._id) {
        throw new errors.NotAuthenticated('Access not allowed');
      }

      // Otherwise just return the hook
      return hook;
    });
  };
};
