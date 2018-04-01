require = require("esm")(module/*, options*/);
console.time('mostly-admin-services import');
module.exports = require('./src/index').default;
module.exports.entities = require('./src/entities').default;
module.exports.models = require('./src/models').default;
console.timeEnd('mostly-admin-services import');
