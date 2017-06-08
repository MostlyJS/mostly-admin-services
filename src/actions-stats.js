import { merge, forEach } from 'lodash';
import makeDebug from 'debug';
import { Service } from 'feathers-memory';

const debug = makeDebug('mostly:admin:service:actionsStats');

class ActionsStatsService extends Service {

  constructor(options) {
    options = merge({}, options);
    super(options);
    this.name = options.name || 'ActionsStatsService';
    this.sampleInterval = options.sampleInterval || 10000;
  }

  setup(app) {
    this.app = app;
    this._refresh();
    setInterval(() => {
      this._refresh();
    }, this.sampleInterval);
  }

  _refresh() {
    this.app.trans.act({
      topic: 'stats',
      cmd: 'actionsInfo',
      maxMessages$: -1
    }, (err, resp) => {
      if (err) {
        return console.error('Error when refresh actionsInfo: ', err);
      }
      forEach(resp.actions, action => {
        action = merge(action, {
          id: resp.app + '-' + action.pattern.topic + '-' + action.pattern.cmd,
          app: resp.app,
          ts: resp.ts
        });
        debug('refresh action', action);
        this.remove(action.id);
        this.create(action);
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
