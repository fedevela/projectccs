'use strict';

// src/services/servicioRegistroVentas/hooks/process.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

module.exports = function(options) {
  return function(hook) {

//    console.log('registrando venta 2 hook ');

    // The authenticated user
    const user = hook.params.user;
    // The actual servicioRegistroVentas text
    const text = '';

    // Append the original data
    hook.data.text = text;
    hook.data.userId = user._id;
    hook.data.createdAt = new Date().getTime();

    var numVentasRegistradas = user.numVentasRegistradas || 0;
    var numVentasCanceladas = user.numVentasCanceladas || 0;

    if (hook.data.registroVentaTipo === 'crear'){
      numVentasRegistradas = numVentasRegistradas + 1;
    } else if (hook.data.registroVentaTipo === 'cancelar'){
      numVentasRegistradas = numVentasRegistradas - 1;
      numVentasCanceladas = numVentasCanceladas + 1;
    }
//    console.log('registrando venta 4 hook ');
//    console.log('registrando venta 4:1' + hook.params.user);

    hook.app.service('users').patch(user._id,{
        numVentasRegistradas : numVentasRegistradas,
        numVentasCanceladas : numVentasCanceladas
    });

//    console.log('registrando venta 5 hook create usuario');
  };
};
