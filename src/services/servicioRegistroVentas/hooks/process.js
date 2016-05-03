'use strict';

// src/services/servicioRegistroVentas/hooks/process.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

module.exports = function(options) {
  return function(hook) {

//    console.log("registrando venta 2 hook ");

    // The authenticated user
    const user = hook.params.user;
    // The actual servicioRegistroVentas text
    const text = "";
    
    // Override the original data
    hook.data = {
      text,
      // Set the user id
      userId: user._id,
      // Add the current time via `getTime`
      createdAt: new Date().getTime()
    };
//    console.log("registrando venta 3 hook ");

    var numeroDeClics = user.numeroDeClics || 0;
    numeroDeClics = numeroDeClics + 1;
//    console.log("registrando venta 4 hook ");
//    console.log("registrando venta 4:1" + hook.params.user);

    hook.app.service('users').patch(user._id,{numeroDeClics : numeroDeClics});

//    console.log("registrando venta 5 hook create usuario");
  };
};