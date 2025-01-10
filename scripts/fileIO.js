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
    writeDotEnvToken,
    checkTexFile
}

/**
 * Save the current status to a file
 * @param {Array<JSON>} arrayData the data to save
 * @param {Number} year the year of the donations
 * @param {Number} donationsTotal the total sum of donations
 * @returns {Number} the status code of the operation
 */
function saveStatusToFile(arrayData, year, donationsTotal) {
    let json = JSON.stringify({"year": year, "donationsTotal": donationsTotal, "data": arrayData });
    let filePath = config.get('save-filePath') || __dirname + "\\data.json";
    try {
        fs.writeFileSync(filePath, json);
        return {"Status": 201,"Response": "Data Saved Successfully!"};
    } catch (error) {
        return {"Status": 500 ,"Response": "Error while saving the data" + error};
    }
}

/**
 * Load the last saved status from a file
 * @returns {Array<JSON>} the data
 */
function loadStatusFromFile() {
    let filePath = config.get('save-filePath') || __dirname + "\\data.json";
    if(!fs.existsSync(filePath)) {
        console.info('File info: No status could be loaded from: ' + filePath);
        return undefined;
    }
    try {
        const data = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
        console.info('File info: Last saved status loaded from: ' + filePath);
        return JSON.parse(data);
    } catch(error) {
        console.error('Parsing Error: Server ran into an issue when reading the save-file:\n' + error);
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
        filePath = `./main${inject == 0 ? '': inject}.tex`;
        inject ++;
    } while(fs.existsSync(filePath));
    try {
        fs.writeFileSync(filePath, data);
        console.log("LaTeX-FILE SUCCESSFULL CREATED")
        return {"Status": 201,"Response": "LaTeX-File Created Successfully!"};
    } catch (error) {
        return {"Status": 500 ,"Response": "Error while creating LaTeX-File" + error};
    }
}

/**
 * Load and read the LaTeX Template
 * @returns {String} the LaTeX Template
 */
function getTexTemplate() {
    let filePath = path.resolve(process.cwd(), config.get('templatePath'));
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    else throw new Error('LaTeX-Template does not exist');
}

/**
 * Check if the LaTeX File exists
 * @returns {String} the path to the LaTeX File
 */
function checkTexFile() {
    let filePath = path.resolve(process.cwd(), './main.tex');
    if (fs.existsSync(filePath)) return filePath;
    else throw new Error('LaTeX-File does not exist');
}

/**
 * Write the API Token to the .env File
 * @param {String} token the API Token
 */
function writeDotEnvToken(token) {
    let filePath = path.resolve(process.cwd(), ".env")
    let vars = ['API_TOKEN = ' + token];
    fs.writeFileSync(filePath, vars.join(os.EOL));

    //Check if the token was saved correctly
    require('dotenv').config();
    if(process.env.API_TOKEN == token) return {"Status": 200,"Response": "Token saved successfully!"};
    else return {"Status": 500 ,"Response": "An error occured while saving the token"};
}