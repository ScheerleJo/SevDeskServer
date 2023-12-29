DocumentType = module;

const config = require('config');

const PORT = config.get('server.port');
const VERSION = config.get('application.server-version');

module.exports = {
    PORT,
    VERSION,
    getSaveDataPath
}


function getSaveDataPath() {
    return config.get('activeData.path') + config.get("activeData.filename");
}
