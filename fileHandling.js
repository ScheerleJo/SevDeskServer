DocumentType = module;

const fs = require('fs');
const config = require('./configHandling');
const downloads = require('downloads-folder');

module.exports = {
    saveStatusToFile,
    loadStatusFromFile,
    getTexData,
    writeTexData
}

/**
 * Gef File Path from Config of FileDialog
 * @param {string} reqAction ('save'/'load'/)
 * @returns {string} filePath of selectedDataSafe
 */
function getFilePath(reqAction){
    let path = config.getSaveDataPath();
    if(path != "") {
        path = __dirname + "./data.json"
    //Open FileSaveDialog / FileOpenDialog
        switch(reqAction){
            case 'save': break;
            case 'load': break;
        }

    }
    return path;
}

function saveStatusToFile(data) {
    let path = getFilePath('save');
    try {
        fs.writeFileSync(path, data);
    } catch (error) {
        return error;
    }
    return 200;
}

function loadStatusFromFile() {
    let path = getFilePath('load');
    let data = "";

    try{
        data = fs.readFileSync(path);
    } catch (Error) {
        return Error;
    }
    return data;
}

function writeTexData(data) {

    let path = downloads() + '/main.tex';
    try {
        fs.writeFileSync(path, data);
    } catch (error) {
        return error;
    }
}

function getTexData(filename) {
    let path = './LaTeX-Templates/' + filename;

    const data = fs.readFileSync(path ,
    { encoding: 'utf8', flag: 'r' });


    return data;
}