DocumentType = module;

const { configDotenv, config } = require('dotenv');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

let responseData = 'Hello, i am Data'

module.exports = {
    getDonations,
    getContacts,
    getJsonData,
    getData
}


async function makeSevDeskRequest(method = String , querystring = String) {
    baseUrl = 'https://my.sevdesk.de/api/v1/';
    let req = baseUrl + querystring;
    let config =  { headers:{'Authorization': process.env.API_TOKEN } }

    let response = await axios.get(req, config);

    try {
        data = response.data
    } catch (error) {
        console.log(error)
        await setTimeout(() => {return;}, 500);
        console.log('sleep')
    }
    let resData = await response.data
    // console.log(resData)
    return await resData
}


async function getDonations(year, _callback){
    let request = "Voucher?embed=accountingTypes%2CaccountingTypes.accountingSystemNumber%2Csupplier%2Csupplier.category%2Cobject%2Cdebit%2Cdelinquent&countAll=true&limit=none&voucherType=VOU&emptyState=true&accountingType[id]=679076&accountingType[objectName]=AccountingType&year=" + year
    responseData = await makeSevDeskRequest('GET', request);
    // responseData = await data;
    _callback();
}

async function getContacts(){
    return await makeSevDeskRequest('GET', 'Contact')
}

async function getContactByID(id){
    return await makeSevDeskRequest('GET', 'Contact/' + id)
}

async function getAdressByContactID (id) {
    return await makeSevDeskRequest('GET', `ContactAddress?contact[id]=${id}&contact[objectName]=Contact`)

    // https://my.sevdesk.de/api/v1/ContactAddress?contact[id]=37668965&contact[objectName]=Contact
}
