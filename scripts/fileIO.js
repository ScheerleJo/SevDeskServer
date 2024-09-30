DocumentType = module;

const fs = require('fs');
const downloads = require('downloads-folder');
const path = require('path');
const os = require('os');
const config = new (require('./configuration'))();

module.exports = {
    saveStatusToFile,
    loadStatusFromFile,
    getTexTemplate,
    writeTexDoc,
    writeDotEnvToken
}

/**
 * Save the current status to a file
 * @param {Array<JSON>} arrayData the data to save
 * @param {Number} year the year of the donations
 * @param {Number} donationsTotal the total sum of donations
 * @returns {Number} the status code of the operation
 */
function saveStatusToFile(arrayData, year, donationsTotal) {
    let json = JSON.stringify({
        "Year": year,
        "DonationsTotal": donationsTotal,
        "Data": arrayData
    });
    let filePath = config.get('save-filePath') || __dirname + "\\data.json";
    try {
        fs.writeFileSync(filePath, json);
        return 201;
    } catch (error) {
        return error;
    }
}

/**
 * Load the last saved status from a file
 * @returns {Array<JSON>} the data
 */
function loadStatusFromFile() {
    let filePath = config.get('save-filePath') || __dirname + "\\data.json";
    try {
        const data = fs.readFileSync(filePath ,
        { encoding: 'utf8', flag: 'r' });
        console.log('last saved status loaded from: ' + filePath);
        return JSON.parse(data);
    } catch(error) {
        console.log('No status could be loaded from: ' + filePath);
        return undefined;
    }
}

/**
 * Write the LaTeX Document to a file
 * @param {String} data the LaTeX Document as a string
 * @returns {Number} the status code of the operation
 */
function writeTexDoc(data) {
    let filePath;
    let inject = 0;
    do {
        filePath = downloads();
        filePath += `/main${inject == 0 ? '': inject}.tex`;
        inject ++;
    } while(fs.existsSync(filePath));
    try {
        fs.writeFileSync(filePath, data);
        return 201;
    } catch (error) {
        return error;
    }
}

/**
 * Load and read the LaTeX Template
 * @returns {String} the LaTeX Template
 */
function getTexTemplate() {
    let filePath = path.join(process.cwd(), config.get('templatePath'));

    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath,
        { encoding: 'utf8', flag: 'r' });
        return data;
    }
    else {
        throw new Error('LaTeX-Template does not exist');
    }
}

/**
 * Write the API Token to the .env File
 * @param {String} token the API Token
 */
function writeDotEnvToken(token) {
    let filePath = path.resolve(process.cwd(), ".env")
    let vars = ['API_TOKEN = ' + token];
    fs.writeFileSync(filePath, vars.join(os.EOL));
}