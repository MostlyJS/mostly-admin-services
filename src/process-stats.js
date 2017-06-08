import { merge } from 'lodash';
import makeDebug from 'debug';
import { Service } from 'feathers-memory';

const debug = makeDebug('mostly:admin:service:processStats');

const defaultOptions = {
  idField: 'app'
};

class ProcessStatsService extends Service {

  constructor(options) {
    options = merge({}, defaultOptions, options);
    super(options);
    this.name = options.name || 'ProcessStatsService';
    this.sampleInterval = options.sampleInterval || 10000;
  }

  setup(app) {
    this.app = app;
    setInterval(() => {
      this._refresh();
    }, this.sampleInterval);
  }

  _refresh() {
    this.app.trans.act({
      topic: 'stats',
      cmd: 'processInfo',
      maxMessages$: -1
    }, (err, resp) => {
      if (err) {
        return console.error('Error when refresh processInfo: ', err);
      }
      debug('refresh processInfo', resp);
      this.find({ query: {
        app: resp.app
      }}).then(results => {
        if (results && results.length > 0) {
          this.update(results[0].app, resp);
        } else {
          this.create(resp);
        }
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
  return new ProcessStatsService(options);
}

init.Service = Service;
