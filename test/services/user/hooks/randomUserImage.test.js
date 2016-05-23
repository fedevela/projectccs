'use strict';

const assert = require('assert');
const randomUserImage = require('../../../../src/services/user/hooks/randomUserImage.js');

describe('user randomUserImage hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    randomUserImage()(mockHook);

    assert.ok(mockHook.randomUserImage);
  });
});
