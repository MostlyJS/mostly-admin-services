import makeDebug from 'debug';
import errors from 'feathers-errors';
import { map } from 'lodash';
import { Service, createModel } from 'mostly-feathers-mongoose';
import defaultHooks from './actions-stats-hooks';

const debug = makeDebug('mostly:admin:service:actionsStats');

const defaultOptions = {
  name: 'ActionsStats',
  sampleInterval: 10000
};

class ActionsStats extends Service {

  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
    this.sampleInterval = options.sampleInterval;
  }

  setup(app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
    this._subActionsInfo();
  }

  _subActionsInfo() {
    this.app.trans.add({
      pubsub$: true,
      topic: 'stats',
      cmd: 'actionsInfo'
    }, (resp) => {
      const info = resp.info;
      if (!info) return;
      let updateActions = map(info.actions, action => {
        action = Object.assign(action, {
          action: action.pattern.topic + '.' + action.pattern.cmd,
          app: info.app,
          ts: info.ts
        });
        //debug('refresh action', action);
        return this.find({ query: {
          action: action.action,
          app: action.app
        }}).then(result => {
          if (result && result.data.length > 0) {
            return this.update(result.data[0].id, action);
          } else {
            return this.create(action);
          }
        });
      });
      Promise.all(updateActions).then(() => {
        // remove outdated actions
        return this.remove(null, { query: {
          $multiple: true,
          ts: { $lt: Date.now() - this.sampleInterval * 3 }
        }});
      }).catch(console.error);
    });
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({}, options);
  if (!options.Model) {
    options.Model = createModel(app, 'stats_action');
  }
  const service = new ActionsStats(options);
  if (hooks) service.hooks(hooks);
  return service;
}

init.Service = ActionsStats;
