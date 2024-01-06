DocumentType = module;

const fs = require('fs');
const config = require('./configHandling');
const downloads = require('downloads-folder');

module.exports = {
    saveStatusToFile,
    loadStatusFromFile,
    getTexData,
    writeTexDoc
}

/**
 * Gef File Path from Config of FileDialog
 * @param {string} reqAction ('save'/'load'/)
 * @returns {string} filePath of selectedDataSafe
 */
function getFilePath(reqAction){
    let path = config.getSaveDataPath();
    path = __dirname + "\\data.json"
    // if(path == "") {
    //Open FileSaveDialog / FileOpenDialog in future
    //}
    return path;
}

function saveStatusToFile(arrayData) {
    let path = getFilePath('save');
    let json = JSON.stringify(arrayData);
    try {
        fs.writeFileSync(path, json);
    } catch (error) {
        return error;
    }
    return 200;
}

function loadStatusFromFile() {
    let path = getFilePath('load');
    try {
        const data = fs.readFileSync(path ,
        { encoding: 'utf8', flag: 'r' });
        return JSON.parse(data);
    } catch(error) {
        console.log('No status could be loaded from: ' + path)
        return undefined;
    }
}

function writeTexDoc(data) {

    let path = downloads() + '/main.tex';
    try {
        fs.writeFileSync(path, data);
    } catch (error) {
        return error;
    }
    return 200;
}

function getTexData(filename) {
    let path = './LaTeX-Templates/' + filename;
    const data = fs.readFileSync(path ,
    { encoding: 'utf8', flag: 'r' });
    return data;
}