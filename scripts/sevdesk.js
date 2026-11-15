const axios = require('axios');
const config = require('./configuration');
const { ApiError } = require('./errors');

const BASE_URL = 'https://my.sevdesk.de/api/v1/';

/**
 * GET request to the SevDesk API.
 * @param {String} query path and query string relative to the API base
 * @returns {Promise<Array>} the "objects" of the response
 */
async function get(query) {
    const token = process.env.API_TOKEN;
    if (!token) throw new ApiError(412, 'TOKEN_MISSING', 'Es ist kein SevDesk-API-Token hinterlegt.');
    try {
        const response = await axios.get(BASE_URL + query, { headers: { Authorization: token }, timeout: 60000 });
        return response.data.objects || [];
    } catch (error) {
        const status = error.response && error.response.status;
        console.error(`SevDesk request failed (${status || error.code}): ${error.message}`);
        if (status === 401 || status === 403) {
            throw new ApiError(502, 'SEVDESK_UNAUTHORIZED', 'SevDesk hat den API-Token abgelehnt.');
        }
        throw new ApiError(502, 'SEVDESK_ERROR', `Die Anfrage an SevDesk ist fehlgeschlagen: ${error.message}`);
    }
}

/**
 * All donation vouchers of a year, optionally only for one contact.
 * @param {Number} year
 * @param {String} [contactId]
 */
function getDonations(year, contactId) {
    let query = 'Voucher?embed=supplier&countAll=true&limit=none&voucherType=VOU&emptyState=true'
        + `&accountingType[id]=${config.accountingTypeId}&accountingType[objectName]=AccountingType&year=${year}`;
    if (contactId) query += `&contact[objectName]=Contact&contact[id]=${encodeURIComponent(contactId)}`;
    return get(query);
}

/** All contact addresses including their contact and country. */
function getAddresses() {
    return get('ContactAddress?limit=none&embed=contact%2Ccountry');
}

module.exports = { getDonations, getAddresses };
