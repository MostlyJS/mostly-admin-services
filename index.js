if (!global._babelPolyfill) { require('babel-polyfill'); }

module.exports.processStats = require('./lib/process-stats');
module.exports.actionsStats = require('./lib/actions-stats');
