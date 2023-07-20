DocumentType = module;

const { configDotenv, config } = require('dotenv');
const axios = require('axios');
// const fs = require('fs');
require('dotenv').config();


module.exports = {
    getDonations,
    getContacts
}
async function makeSevDeskRequest(method = String , querystring = String) {
    baseUrl = 'https://my.sevdesk.de/api/v1/'
    let req = baseUrl + querystring
    let config =  { headers:{'Authorization': process.env.API_TOKEN } }
    
    let response = await axios.get(req, config)
    let resData = response.data
    // console.log(resData)
    return resData
}


async function getDonations(year){
    let request = "Voucher?embed=accountingTypes%2CaccountingTypes.accountingSystemNumber%2Csupplier%2Csupplier.category%2Cobject%2Cdebit%2Cdelinquent&countAll=true&limit=none&voucherType=VOU&emptyState=true&accountingType[id]=679076&accountingType[objectName]=AccountingType&year=" + year
    let data = await makeSevDeskRequest('GET', request)
    return data
}

async function getContacts(){
    return await makeSevDeskRequest('GET', 'Contact')
}

async function getContactByID(id){
    let data = await makeSevDeskRequest('GET', 'Contact/' + id)
}

async function getAdressByContactID (id) {
    let data = await makeSevDeskRequest('GET', `ContactAddress?contact[id]=${id}&contact[objectName]=Contact`) 
    // https://my.sevdesk.de/api/v1/ContactAddress?contact[id]=37668965&contact[objectName]=Contact
}
async function listDonationsPerUserID(year) {
    data = await getDonations(year)

    //sort alphabetical by objects.supplier.familyname 
}
// getDonations(2023)

// getContactByID(37668965)