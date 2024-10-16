DocumentType = module;

const parseUrl = require('url-parse');


module.exports = {
    getYearFromQuery,
    getDeleteItem,
    getMoveItem,
    getToken,
    getReloadUsers
}


/**
 * Get Year from QueryParams
 * @param {url} url req.url of express.get()
 * @returns {Number} year
 */
function getYearFromQuery(url) {
    return parseUrl(url, true).query.year;
}


/**
 * Get QueryParams from '/deleteItem' request
 * @param {url} url
 * @returns {Array<String>} [DonatorIndex, DonationIndex, DeleteAll | false]
 */
function getDeleteItem(url) {
    let deleteInfo = parseUrl(url, true).query;
    if(deleteInfo.donatorIndex == undefined) {
        return console.error('Error at /deleteItem Request!\nNo donator was specified to delete.\n\n Error was thrown at `urlHandling.js:33`');
    }
    if(deleteInfo.donationIndex == undefined) {
        deleteInfo.donationIndex = false;
    }
    if(deleteInfo.deleteAll == undefined){
        deleteInfo.deleteAll = false;
    }
    return deleteInfo;
}

/**
 * Get donatorIndex from QueryParams
 * @param {url} url
 * @returns {Number} Index of Donator to Move the status;
 */
function getMoveItem(url) {
    return parseUrl(url, true).query.donatorIndex;
}
/**
 * Get Token from QueryParams
 * @param {url} url
 * @returns {String} API-Token from SevDesk;
 */
function getToken(url) {
    return parseUrl(url, true).query.token;
}

function getReloadUsers(url) {
    parseUrl(url, true).query.split('-');
}