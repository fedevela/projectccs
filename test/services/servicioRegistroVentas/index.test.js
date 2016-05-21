'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('servicioRegistroVentas service', () => {
  it('registered the servicioRegistroVentas service', () => {
    assert.ok(app.service('servicioRegistroVentas'));
  });
});
