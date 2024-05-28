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



function saveStatusToFile(arrayData, year) {
    let json = JSON.stringify({
        "Year": year,
        "Data": arrayData
    });
    try {
        fs.writeFileSync(__dirname + "\\data.json", json);
        return 200;
    } catch (error) {
        return error;
    }
}

function loadStatusFromFile() {
    let filePath = __dirname + "\\data.json";
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
        return 200;
    } catch (error) {
        return error;
    }
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
