DocumentType = module;

const parseUrl = require('url-parse');


module.exports = {
    getYearFromQuery,
    getDeleteItem
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
        return console.error('Error at /deleteItem Request!\nNo donator was specified to delete.\n\n Error was thrown at `urlHandling.js:36`');
    }
    if(deleteInfo.donationIndex == undefined) {
        deleteInfo.donationIndex = false;
    }
    if(deleteInfo.deleteAll == undefined){
        deleteInfo.deleteAll = false;
    }
    return deleteInfo;
}
