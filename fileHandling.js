DocumentType = module;

const fs = require('fs');
const config = require('./configHandling');

module.exports = {
    saveStatusToFile
}

/**
 * Gef File Path from Config of FileDialog
 * @param {string} reqAction ('save'/'open')
 * @returns {string} filePath of selectedDataSafe
 */
function getFilePath(reqAction){
    let path = config.getSaveDataPath();
    if(path != "") {
        
    //Open FileSaveDialog / FileOpenDialog
    } else if(reqAction == 'save') {


    
    } else if(reqAction == 'load') {

    }
    return path;
}

function getDataFromURL(url) {
    return parseUrl(url).query.data;
}


function saveStatusToFile(url) {
    let data = getDataFromURL(url);
    let path = getFilePath('save');


    try {
        fs.writeFileSync(path, data);
    } catch (Error) {
        return Error;
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