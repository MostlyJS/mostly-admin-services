import { forEach } from 'lodash';
import makeDebug from 'debug';
import { Service } from 'feathers-memory';
import errors from 'feathers-errors';
import defaultHooks from './actions-stats-hooks';
import { sorter } from '../../utils';

const debug = makeDebug('mostly:admin:service:actionsStats');

const defaultOptions = {
  sorter: sorter
};

class ActionsStatsService extends Service {

  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
    this.name = options.name || 'ActionsStatsService';
    this.sampleInterval = options.sampleInterval || 10000;
  }

  setup(app) {
    this.app = app;
    this.hooks(defaultHooks);
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
      forEach(info.actions, action => {
        action = Object.assign(action, {
          id: info.app + '-' + action.pattern.topic + '-' + action.pattern.cmd,
          app: info.app,
          ts: info.ts
        });
        //debug('refresh action', action);
        this.find({ query: {
          id: action.id
        }}).then(results => {
          if (results && results.length > 0) {
            return this.update(action.id, action);
          } else {
            return this.create(action);
          }
        }).then(() => {
          // remove outdated actions
          return this.remove(null, { query: {
            ts: { $lt: Date.now() - this.sampleInterval * 3 }
          }}).catch(errors.NotFound);
        }).catch(console.error);
      });
    });
  }

  find(params) {
    return super.find(params);
  }

  get(id, params) {
    return super.get(id, params);
  }

  create(data, params) {
    return super.create(data, params);
  }

  update(id, data, params) {
    return super.update(id, data, params);
  }

  patch(id, data, params) {
    return super.patch(id, data, params);
  }

  remove(id, params) {
    return super.remove(id, params);
  }
}

export default function init (options, hooks) {
  return new ActionsStatsService(options);
}

init.Service = Service;
