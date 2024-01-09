DocumentType = module;

const fs = require('fs');
const config = require('./configHandling');
const downloads = require('downloads-folder');
const path = require('path');
const os = require('os')

module.exports = {
    saveStatusToFile,
    loadStatusFromFile,
    getTexData,
    writeTexDoc,
    writeDotEnvToken
}

/**
 * Gef File Path from Config of FileDialog
 * @param {string} reqAction ('save'/'load'/)
 * @returns {string} filePath of selectedDataSafe
 */
function getFilePath(reqAction){
    let filePath = config.getSaveDataPath();
    filePath = __dirname + "\\data.json"
    // if(path == "") {
    //Open FileSaveDialog / FileOpenDialog in future
    //}
    return filePath;
}

function saveStatusToFile(arrayData, year) {
    let filePath = getFilePath('save');

    let data = {
        "Year": year,
        "Data": arrayData
    }

    let json = JSON.stringify(data);
    try {
        fs.writeFileSync(filePath, json);
    } catch (error) {
        return error;
    }
    return 200;
}

function loadStatusFromFile() {
    let filePath = getFilePath('load');
    try {
        const data = fs.readFileSync(filePath ,
        { encoding: 'utf8', flag: 'r' });
        return JSON.parse(data);
    } catch(error) {
        console.log('No status could be loaded from: ' + filePath)
        return undefined;
    }
}

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
    } catch (error) {
        return error;
    }
    return 200;
}

function getTexData(filename) {
    let filePath = './LaTeX-Templates/' + filename;
    const data = fs.readFileSync(filePath ,
    { encoding: 'utf8', flag: 'r' });
    return data;
}

function writeDotEnvToken(token) {
    let filePath = path.resolve(process.cwd(), ".env")
    let vars = ['API_TOKEN = ' + token];
    fs.writeFileSync(filePath, vars.join(os.EOL));

}