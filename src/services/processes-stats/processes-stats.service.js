import makeDebug from 'debug';
import { Service, createModel } from 'mostly-feathers-mongoose';
import defaultHooks from './processes-stats.hooks';

const debug = makeDebug('mostly:admin-service:processStats');

const defaultOptions = {
  name: 'processes-stats',
  sampleInterval: 10000
};

class ProcessStats extends Service {

  constructor (options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
    this.sampleInterval = options.sampleInterval;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
    this._subProcessInfo();
  }

  _subProcessInfo () {
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
          return this.update(results.data[0].id, proc);
        } else {
          return this.create(proc);
        }
      }).then(() => {
        // remove outdated process
        return this.remove(null, {
          query: {
            ts: { $lt: Date.now() - this.sampleInterval * 3 }
          },
          $multi: true
        });
      }).catch(console.error);
    });
  }
}

export default function init (app, options, hooks) {
  options = Object.assign({}, options);
  if (!options.Model) {
    options.Model = createModel(app, 'stats_process');
  }
  const service = new ProcessStats(options);
  if (hooks) service.hooks(hooks);
  return service;
}

init.Service = ProcessStats;
