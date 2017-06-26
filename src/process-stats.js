import { merge } from 'lodash';
import makeDebug from 'debug';
import { Service } from 'feathers-memory';
import errors from 'feathers-errors';

const debug = makeDebug('mostly:admin:service:processStats');

class ProcessStatsService extends Service {

  constructor(options) {
    options = merge({}, options);
    super(options);
    this.name = options.name || 'ProcessStatsService';
    this.sampleInterval = options.sampleInterval || 10000;
  }

  setup(app) {
    this.app = app;
    this._subProcessInfo();
  }

  _subProcessInfo() {
    this.app.trans.add({
      pubsub$: true,
      topic: 'stats',
      cmd: 'processInfo'
    }, (resp) => {
      const info = resp.info;
      if (!info) return;
      debug('refresh process', info);
      let proc = merge(info, {
        id: info.app
      });
      this.find({ query: {
        id: proc.id
      }}).then(results => {
        if (results && results.length > 0) {
          return this.update(proc.id, proc);
        } else {
          return this.create(proc);
        }
      }).then(() => {
        // remove outdated process
        return this.remove(null, { query: {
          ts: { $lt: Date.now() - this.sampleInterval * 3 }
        }}).catch(errors.NotFound);
      }).catch(console.error);
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
  return new ProcessStatsService(options);
}

init.Service = Service;
