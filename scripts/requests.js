DocumentType = module;
const axios = require('axios');

var responseData = 'Hello, i am Data'
var addressData = 'Hello, i am Data'

module.exports = {
    getDonations,
    getData,
    getAddressData,
    getAllAddresses
}


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

async function getDonations(year, user = undefined){
    let request = "Voucher?embed=accountingTypes%2CaccountingTypes.accountingSystemNumber%2Csupplier%2Csupplier.category%2Cobject%2Cdebit%2Cdelinquent&countAll=true&limit=none&voucherType=VOU&emptyState=true&accountingType[id]=679076&accountingType[objectName]=AccountingType&year=" + year
    if(user != undefined) request += "&contact[objectName]=Contact&contact[id]=" + user;
    return await makeSevDeskRequestGET(request);
}

async function getAllAddresses(_callback) {
    let request = "ContactAddress?limit=none&embed=contact%2Cstreet%2Czip%2Ccity%2Ccountry";
    return await makeSevDeskRequestGET(request);
}

function getData(){
    return responseData;
}
function getAddressData(){
    return addressData;
}