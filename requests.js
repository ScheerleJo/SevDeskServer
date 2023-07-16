type=module;
const fetch = require('node-fetch');
const fs = require('fs')
require('dotenv').config();

var express;

// function getExpressApp(app) {
//     express = app;
// }
module.exports = {
    getDonations,
    getContacts
}
async function makeSevDeskRequest(method , querystring = undefined) {
    baseUrl = 'https://my.sevdesk.de/api/v1/'
    let req = baseUrl + querystring

    console.log(req);

    let resData

    fetch(req, {
        method: method,
        headers: {
            'Authorization': process.env.API_TOKEN
        }
    }).then(response => {
        if (response.ok) {
            response.json().then((data) => {
                resData = data;
            });  
        } else {
            throw 'There is something wrong';
        }
        }).catch(error => {
            console.log(error);
        });
    
    return resData;
}

//TUT NOCH NET
async function getDonations(year){
    let data = [];
    let date = new Date()
    for(let month = 1; month <= date.getMonth(); month++) {
        res = await makeSevDeskRequest('GET', `Voucher?year=${year}&month=${month}&creditDebit=D`)
        
        for(let item = 0; item < res.length; item++) {
            data.push(res.object[item])
        }

    }

    //`Voucher?year=${year}&month=${month}&descriptionLike=Spende`
    return data
    
    // https://my.sevdesk.de/api/v1/Voucher?year=2023&month=01&descriptionLike=Spende
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
function listDonationsPerUserID(id) {
    data = getDonations()

    let userDonation = {}
    
    
}


// console.log(getDonations(2023))

console.log(getContacts())

// getContactByID(37668965)

