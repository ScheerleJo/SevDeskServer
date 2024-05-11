DocumentType = module;
const axios = require('axios');

let responseData = 'Hello, i am Data'
let addressData = 'Hello, i am Data'

module.exports = {
    getDonations,
    getUserSpecificDonations,
    getData,
    getAddressData,
    getAllAddresses
}


async function makeSevDeskRequestGET(querystring) {
    require('dotenv').config();
    let token = process.env.API_TOKEN;
    baseUrl = 'https://my.sevdesk.de/api/v1/';
    let req = baseUrl + querystring;
    let config =  { headers:{'Authorization': token } }
    let response;
    response = await axios.get(req, config).catch((error) => {
        console.log(error);
    });    
    try {
        data = response.data;
    } catch (error) {
        console.log(error);
        await setTimeout(() => {return;}, 500);
        console.log('sleep');
    }
    let resData = await response.data
    return await resData
}


async function getDonations(year, _callback){
    let request = "Voucher?embed=accountingTypes%2CaccountingTypes.accountingSystemNumber%2Csupplier%2Csupplier.category%2Cobject%2Cdebit%2Cdelinquent&countAll=true&limit=none&voucherType=VOU&emptyState=true&accountingType[id]=679076&accountingType[objectName]=AccountingType&year=" + year
    responseData = await makeSevDeskRequestGET(request);
    _callback();
}
async function getUserSpecificDonations(year, _callback){
    let request = "Voucher?embed=accountingTypes%2CaccountingTypes.accountingSystemNumber%2Csupplier%2Csupplier.category%2Cobject%2Cdebit%2Cdelinquent&countAll=true&limit=none&voucherType=VOU&emptyState=true&accountingType[id]=679076&accountingType[objectName]=AccountingType&year=2023&contact[objectName]=Contact&contact[id]=41458077";
    responseData = await makeSevDeskRequestGET(request);
    _callback();
}

async function getAllAddresses(_callback) {
    let request = "ContactAddress?limit=none&embed=contact%2Cstreet%2Czip%2Ccity%2Ccountry";
    addressData = await makeSevDeskRequestGET(request);
    _callback();
}

function getData(){
    return responseData;
}
function getAddressData(){
    return addressData;
}