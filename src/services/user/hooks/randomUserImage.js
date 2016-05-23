'use strict';

// src/services/user/hooks/randomUserImage.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

const defaults = {};

module.exports = function(options) {
  options = Object.assign({}, defaults, options);

  return function(hook) {
    hook.randomUserImage = true;
    var gender = (Math.random() > 0.5) ? "men" : "women";
    var index = Math.floor((Math.random() * 99) + 1);
    hook.data.profileImg = "https://randomuser.me/api/portraits/thumb/"+gender+"/"+index+".jpg";
    console.log(hook.data.profileImg);
  };
};
