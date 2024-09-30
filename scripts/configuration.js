class ConfigHandling {

    constructor() {
        this.nconf = new (require('nconf')).Provider();
        this.path = require('path');
        this.fs = require('fs');

        this.nconf.argv().env()

        this.nconf.file('server', this.path.join(process.cwd(), 'config' , 'server_config.json'))
        this.nconf.file('latex', this.path.join(process.cwd(), 'config', 'latex_config.json'));
    }

    /**
     * Set a value in the config file
     * @param {String} key 
     * @param {*} value 
     * @param {String} store 
     */
    set(key, value, store) {
        this.nconf.set(key, value, { store: store });
        this.nconf.save();
    }

    /**
     * Get a value from the config file
     * @param {String} key
     * @returns {*} the value  
    */
    get(key) {
        return this.nconf.get(key);
    }

    /**
     * Save the the filePath to store the current active data
     * @param {String} path full Path to the file
     */
    setSaveDataPath(path) {
        this.set('save-filePath', path);
    }
    /**
     * Get the filePath to the file to store the current active data
     * @returns {String} the full Path to the file
     */
    getSaveDataPath() {
        return this.get('save-filePath');
    }
    
    /**
     * Get the Port the server is running on
     * @returns {Number} the Port
     */
    getPort() { 
        return this.get('application:server-port'); 
    }

    /**
     * Get the Version of the Tool
     * @returns {String} the Version
     */
    getVersion() {
        return this.get('application:server-version');
    }
}
module.exports = ConfigHandling;