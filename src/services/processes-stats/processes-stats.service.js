const makeDebug = require('debug');
const { Service, createModel } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');

const defaultHooks = require('./processes-stats.hooks');

const debug = makeDebug('mostly:admin-service:processStats');

const defaultOptions = {
  name: 'processes-stats',
  sampleInterval: 10000
};

class ProcessStats extends Service {

  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
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

module.exports = function init (app, options, hooks) {
  options = Object.assign({}, options);
  if (!options.Model) {
    options.Model = createModel(app, 'stats_process');
  }
  const service = new ProcessStats(options);
  if (hooks) service.hooks(hooks);
  return service;
};
module.exports.Service = ProcessStats;
