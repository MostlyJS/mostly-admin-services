import auth from 'feathers-authentication';
import jwt from 'feathers-authentication-jwt';
import local from 'feathers-authentication-local';
import { hooks } from 'mostly-feathers-mongoose';
import { config } from 'common';

export default function(app) {
  
  app.set('auth', config.auth);
  app.configure(auth(config.auth));
  app.configure(jwt());
  app.configure(local());

  app.service('authentication').hooks({
    before: {
      create: [
        auth.hooks.authenticate('jwt', 'local')
      ],
      remove: [
        auth.hooks.authenticate('jwt')
      ]
    },
    after: {
      all: [ hooks.responder() ]
    }
  });
}