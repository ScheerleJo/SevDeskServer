class ConfigHandling {

    constructor() {
        this.nconf = new (require('nconf')).Provider();
        this.path = require('path');
        this.fs = require('fs');

        this.nconf.argv().env()

        this.nconf.file('server', this.path.join(process.cwd(), 'config' , 'server_config.json'))
        this.nconf.file('latex', this.path.join(process.cwd(), 'config', 'latex_config.json'));
    }

    set(key, value, store) {
        this.nconf.set(key, value, { store: store });
        this.nconf.save();
    }
    get(key) {
        return this.nconf.get(key);
    }

    setSaveDataPath(path) {
        this.set('save-filePath', path);
    }
    getSaveDataPath() {
        return this.get('save-filePath');
    }
    
    getPort() { 
        return this.get('application:server-port'); 
    }
    getVersion() {
        return this.get('application:server-version');
    }
}

module.exports = ConfigHandling;