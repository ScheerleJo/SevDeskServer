DocumentType = module;

const fs = require('fs');
const config = require('./configHandling');

module.exports = {
    saveStatusToFile,
    loadStatusFromFile
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

function createTexData(data) {
    let path = process.cwd() + '/main.tex';
    try {
        fs.writeFileSync(path, data);
    } catch (error) {
        return error;
    }
}