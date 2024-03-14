// const DocumentType = module as { new (): DocumentType; prototype: DocumentType; };
const parseUrl = require('url-parse');


module.exports = {
    getYearFromQuery,
    getDeleteItem,
    getMoveItem,
    getToken
}


/**
 * Get Year from QueryParams
 * @param {url} url req.url of express.get()
 * @returns {Number} year
 */
function getYearFromQuery(url):number {
    return parseUrl(url, true).query.year;
}


/**
 * Get QueryParams from '/deleteItem' request
 * @param {url} url
 * @returns {Array<String>} [DonatorIndex, DonationIndex, DeleteAll | false]
 */
function getDeleteItem(url):String[] {
    let deleteInfo = parseUrl(url, true).query;
    if(deleteInfo.donatorIndex == undefined) {
        console.error('Error at /deleteItem Request!\nNo donator was specified to delete.\n\n Error was thrown at `urlHandling.js:36`');
        return [];
    }
    if(deleteInfo.donationIndex == undefined) deleteInfo.donationIndex = false;
    if(deleteInfo.deleteAll == undefined) deleteInfo.deleteAll = false;
    return deleteInfo;
}

/**
 * Get donatorIndex from QueryParams
 * @param {url} url
 * @returns {Number} Index of Donator to Move the status;
 */
function getMoveItem(url):number {
    return parseUrl(url, true).query.donatorIndex;
}
/**
 * Get Token from QueryParams
 * @param {url} url
 * @returns {String} API-Token from SevDesk;
 */
function getToken(url):string {
    return parseUrl(url, true).query.token;
}