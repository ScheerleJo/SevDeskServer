const express = require('express');
var app = express();
const PORT = require('./configHandling').PORT;
const VERSION = require('./configHandling').VERSION;
const requests = require('./requests');
const out = require('./output');
const fileHandler = require('./fileHandling');


app.get('/', (req, res) => {
    console.log("successful request");
    // res.text("Successful");
    res.send("Successful")
});

app.get('/getDonations', (req, res) => {
    let year = requests.getYearFromQuery(req.url);
    requests.getDonations(2023, () => {
        console.log('DATA GATHERING (Donations) COMPLETE')
        out.setDonationData(requests.getData());
        requests.getAllAdresses(() => {
            console.log('DATA GATHERING (Addresses) COMPLETE')
            out.setAddressData(requests.getData());
            let response = out.newFormat();
            // console.log(response);
            
            res.send(response);
        })
    })    
});
app.get('/saveData', (req, res) => {
    let response = fileHandler.saveStatusToFile(req.url);
    res.send({"status": response});     //  Send Status Code (200 for everything okay)
});

app.listen(PORT, function(){  
    console.log(`SevDesk-Extension for BFU-Worms running on Version: ${VERSION}\nServer running on Port ${PORT}`);
});