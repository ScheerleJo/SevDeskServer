DocumentType = module;

const config = require('config');

module.exports = {
    PORT,
    VERSION,
    getSaveDataPath
}

const PORT = config.get('server.port');
const VERSION = config.get('application.version');

function getSaveDataPath() {
    return config.get('activeData.path') + config.get("activeData.filename");
}
