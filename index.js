const config = require('./configHandling')
const requests = require('./requests');
const formatting = require('./formatting');
const sort = require('./sorting');
const fileHandler = require('./fileHandling');
const urlHandler = require('./urlHandling');
const process = require('node:process');
const express = require('express');
const cors = require('cors');
var app = express();


let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
    methods: "GET, PUT, POST"
}

// Options for the Debug Helper to function properly
app.use(cors(corsOptions));



const VERSION = config.VERSION;
const PORT = config.PORT;

let donationData = undefined;
app.get('/', (req, res) => {
    res.send({
        "status": "running",
        "message": "Invalid Branch. Use '/getDonations?year=...' to get all Donations to the input year Use '/saveData?data=...' to save the input Data to a json file"
});
});
app.get('/kill', (req, res) => {
    console.log('The Server will Shutdown with ExitCode 1');
    res.send({"status":"shutdown"});
    process.exit()
});

app.get('/getDonations', (req, res) => {
    requests.getDonations(urlHandler.getYearFromQuery(req.url), () => {
        console.log('DATA GATHERING (Donations) COMPLETE')
        // console.log(requests.getData());
        formatting.setDonationData(requests.getData());
        requests.getAllAddresses(() => {
            console.log('DATA GATHERING (Addresses) COMPLETE')
            formatting.setAddressData(requests.getAddressData());
            donationData = formatting.newFormat();
            res.send(donationData);
            console.log('DATA PUSHED SUCCESSFULLY');
        })
    })    
});
app.get('/saveData', (req, res) => {
    let response = fileHandler.saveStatusToFile(donationData);
    res.send({"status": response});     //  Send Status Code (200 for everything okay)
});

app.get('/deleteItem', (req, res) => { ///deleteItem?donatorIndex=...(num)&donationIndex=...(num)&deleteAll=...(true/false)
    sort.setDonationData(donationData);
    
    donationData = sort.deleteItemAtIndex(urlHandler.getDeleteItem(req.url));
});

app.listen(PORT, function(){  
    console.log(`SevDesk-Extension for BFU-Worms running on Version: ${VERSION}\nServer running on Port ${PORT}`);
});

