DocumentType = module;

const parseUrl = require('url-parse');


module.exports = {
    getYear,
    getMoveItem,
    getToken,
    getMultipleUserIDs
}

/**
 * Get Year from QueryParams
 * @param {URL} url req.url of express.get()
 * @returns {Number} year
 */
function getYear(url) {
    return parseUrl(url, true).query.year;
}

/**
 * Get donatorIndex from QueryParams
 * @param {URL} url Request URL from Express
 * @returns {Number} Index of Donator to Move the status;
 */
function getMoveItem(url) {
    return parseUrl(url, true).query.donatorIndex;
}

/**
 * Get Token from QueryParams
 * @param {URL} url  Request URL from Express
 * @returns {String} API-Token from SevDesk;
 */
function getToken(url) {
    return parseUrl(url, true).query.token;
}


/**
 * Get UserIDs from QueryParams in Form of '?ids=id1-id2-id3-...'
 * @param {URL} url Request URL from Express
 * @returns {Array<Number>}
 */
function getMultipleUserIDs(url) {
    let ids = parseUrl(url, true).query.ids.split('-');
    for(let i = 0; i < ids.length; i++) {
        if(typeof(ids[i]) != "number") ids[i] = parseInt(ids[i]);
    }
    return ids;
}