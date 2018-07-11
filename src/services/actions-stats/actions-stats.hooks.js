const auth = require('feathers-authentication');
const { hooks } = require('mostly-feathers-mongoose');

module.exports = function (options = {}) {
  return {
    before: {
      all: [ auth.hooks.authenticate('jwt') ]
    },
    after: {
      all: [ hooks.responder() ]
    }
  };
};