DocumentType = module;

const { configDotenv, config } = require('dotenv');
const axios = require('axios');
const fs = require('fs');
const parseUrl = require('url-parse');
require('dotenv').config();

let responseData = 'Hello, i am Data'
let adressData = 'Hello, i am Data'

module.exports = {
    getDonations,
    getAdressByContactID,
    getYearFromQuery,
    getData,
    adressData
}


async function makeSevDeskRequest(type, querystring) {
    baseUrl = 'https://my.sevdesk.de/api/v1/';
    let req = baseUrl + querystring;
    let config =  { headers:{'Authorization': process.env.API_TOKEN } }
    let response;
    if(type == 'GET'){
        response = await axios.get(req, config).catch((error) => {
            console.log(error);
        })
    
        try {
            data = response.data
        } catch (error) {
            console.log(error)
            await setTimeout(() => {return;}, 500);
            console.log('sleep')
        }
        
    }
    let resData = await response.data
    // console.log(resData)
    return await resData
}


async function getDonations(year, _callback){
    let request = "Voucher?embed=accountingTypes%2CaccountingTypes.accountingSystemNumber%2Csupplier%2Csupplier.category%2Cobject%2Cdebit%2Cdelinquent&countAll=true&limit=none&voucherType=VOU&emptyState=true&accountingType[id]=679076&accountingType[objectName]=AccountingType&year=" + year
    responseData = await makeSevDeskRequest('GET', request);
    _callback();
}

async function getContacts(){
    return await makeSevDeskRequest('GET', 'Contact')
}

async function getContactByID(id){
    return await makeSevDeskRequest('GET', 'Contact/' + id)
}

async function getAdressByContactID (id, _callback) {
    adressData = await makeSevDeskRequest('GET', `ContactAddress?contact[id]=${id}&contact[objectName]=Contact`)

    _callback();
    // https://my.sevdesk.de/api/v1/ContactAddress?contact[id]=37668965&contact[objectName]=Contact
}

function getYearFromQuery(url) {
    return parseUrl(url).query.year;
}
function getData(){
    return responseData;
}
function getAdressData(){
    return adressData;
}