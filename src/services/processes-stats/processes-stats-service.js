import makeDebug from 'debug';
import errors from 'feathers-errors';
import { Service, createModel } from 'mostly-feathers-mongoose';
import defaultHooks from './processes-stats-hooks';

const debug = makeDebug('mostly:admin:service:processStats');

const defaultOptions = {
  name: 'ProcessStats',
  sampleInterval: 10000
};

class ProcessStats extends Service {

  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
    this.name = options.name;
    this.sampleInterval = options.sampleInterval;
  }

  setup(app) {
    this.app = app;
    this.hooks(defaultHooks);
    this._subProcessInfo();
  }

  _subProcessInfo() {
    this.app.trans.add({
      pubsub$: true,
      topic: 'stats',
      cmd: 'processInfo'
    }, (resp) => {
      const proc = resp.info;
      if (!proc) return;
      //debug('refresh process', proc);
      this.find({ query: {
        app: proc.app
      }}).then(results => {
        if (results && results.data.length > 0) {
          return this.update(results.data[0]._id, proc);
        } else {
          return this.create(proc);
        }
      }).then(() => {
        // remove outdated process
        return this.remove(null, { query: {
          $multiple: true,
          ts: { $lt: Date.now() - this.sampleInterval * 3 }
        }});
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

export default function init(app, options, hooks) {
  options = Object.assign({}, options);
  if (!options.Model) {
    options.Model = createModel(app, 'stats_process');
  }
  const service = new ProcessStats(options);
  if (hooks) service.hooks(hooks);
  return service;
}

init.Service = Service;
