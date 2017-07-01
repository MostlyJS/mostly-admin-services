import auth from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';

module.exports = {
  before: {
    all: [ auth.hooks.authenticate('jwt') ]
  },
  after: {
    all: [ hooks.responder() ]
  }
};