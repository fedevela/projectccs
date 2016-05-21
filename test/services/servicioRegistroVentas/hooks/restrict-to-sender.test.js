'use strict';

const assert = require('assert');
const restrictToSender = require('../../../../src/services/servicioRegistroVentas/hooks/restrict-to-sender.js');

describe('servicioRegistroVentas restrict-to-sender hook', () => {
  it('returns a function', () => {
    var hook = restrictToSender();
    assert.equal(typeof hook, 'function');
  });
});
