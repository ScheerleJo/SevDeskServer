DocumentType = module;
const axios = require('axios');

module.exports = {
    getDonations,
    getAllAddresses
}

/**
 * Make a GET request to the SevDesk API
 * @param {String} querystring the query string for the request
 * @returns {JSON} the response data
 */
async function  makeSevDeskRequestGET(querystring) {
    require('dotenv').config();
    let token = process.env.API_TOKEN;
    baseUrl = 'https://my.sevdesk.de/api/v1/';
    let req = baseUrl + querystring;
    let config =  { headers:{'Authorization': token } }
    try {
        const response = await axios.get(req, config);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

/**
 * Send Get Request to the SevDesk API to get all donations from a specific year
 * @param {Number} year the year to get the donations from
 * @param {NUmber} user fetch donations from a specific user
 * @returns {JSON} the response data
 */
async function getDonations(year, user = undefined){
    let request = "Voucher?embed=accountingTypes%2CaccountingTypes.accountingSystemNumber%2Csupplier%2Csupplier.category%2Cobject%2Cdebit%2Cdelinquent&countAll=true&limit=none&voucherType=VOU&emptyState=true&accountingType[id]=679076&accountingType[objectName]=AccountingType&year=" + year
    if(user != undefined) request += "&contact[objectName]=Contact&contact[id]=" + user;
    return await makeSevDeskRequestGET(request);
}

/**
 * Send Get Request to the SevDesk API to get all Addresses
 * @returns {JSON} the response data
 */
async function getAllAddresses() {
    let request = "ContactAddress?limit=none&embed=contact%2Cstreet%2Czip%2Ccity%2Ccountry";
    return await makeSevDeskRequestGET(request);
}
