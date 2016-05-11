'use strict';

// src/services/message/hooks/process.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

const defaults = {};

module.exports = function(options) {
  options = Object.assign({}, defaults, options);

  return function(hook) {
    try {
        if (!hook.params.user){return;}
      // The authenticated user
      const user = hook.params.user;
      // The actual message text
      var text = (hook.data.text || '');

      text = text
        // Messages can't be longer than 400 characters
        .substring(0, 400)
        // Do some basic HTML escaping
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // Override the original data
      hook.data = {
        text,
        // Set the user id
        userId: user._id,
        // Add the current time via `getTime`
        createdAt: new Date().getTime()
      };
    } catch (err) {
      console.log(err.stack);
      console.error(err);
      throw new Error(err.stack);
    }
  };
};
