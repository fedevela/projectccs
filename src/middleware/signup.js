'use strict';

module.exports = function(app) {
  return function(req, res, next) {
    const body = req.body;

//    console.log('before user create');
    // Get the user service and `create` a new user
    app.service('users').create({
      numVentasRegistradas: 0,
      numVentasCanceladas: 0,
      email: body.email,
      password: body.password
    })
    // Then redirect to the login page
    .then(user => res.redirect('/login.html'))
    // On errors, just call our error middleware
    .catch(next);
    
//    console.log('after user create');
  };
};
