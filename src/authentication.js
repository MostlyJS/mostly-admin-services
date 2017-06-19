import auth from 'feathers-authentication';
import jwt from 'feathers-authentication-jwt';
import local from 'feathers-authentication-local';
import { hooks } from 'mostly-feathers-mongoose';

export default function(options) {
  return function(app) {
    app.set('auth', options);
    app.configure(auth(options));
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
};