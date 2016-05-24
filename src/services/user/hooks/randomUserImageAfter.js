'use strict';

// src/services/user/hooks/randomUserImage.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

function generateImgUrl(){
      var gender = (Math.random() > 0.5) ? "men" : "women";
    var index = Math.floor((Math.random() * 99) + 1);
    var urlStr = "https://randomuser.me/api/portraits/thumb/"+gender+"/"+index+".jpg";
  return urlStr;
}

const defaults = {};

module.exports = function(options) {
options = Object.assign({}, defaults, options);

  return function(hook) {
    hook.randomUserImageAfter = true;

    var urlStr;
    if (hook.result.data && hook.result.data.length){
      for (var i = 0; i < hook.result.data.length ; i++){
        var currentUser = hook.result.data[i];
        urlStr = generateImgUrl();
        if (currentUser.profileImg) {}
        else {
          currentUser.profileImg = urlStr;
          hook.app.service('users').patch(currentUser._id,{
              profileImg : urlStr
          });
        }
      }
    } else if (hook.result._id) {
      urlStr = generateImgUrl();
      if (hook.result.profileImg) {}
      else {
        hook.result.profileImg = urlStr;
        hook.app.service('users').patch(hook.result._id,{
            profileImg : urlStr
        });
      }
    }
  };
};
