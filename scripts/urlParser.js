DocumentType = module;

const parseUrl = require('url-parse');

module.exports = {
    getYear,
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

    let ids = parseUrl(url, true).query.donatorIDs
    ids = ids.split('-');
    for(let i = 0; i < ids.length; i++) {
        if(typeof(ids[i]) != "number") ids[i] = parseInt(ids[i]);
    }
    return ids;
}