const config = new (require('./scripts/configuration'))();
const fileHandler = require('./scripts/fileIO');
const out = require('./scripts/latex');
const func = require('./scripts/functions');
const express = require('express');
var app = express();

const VERSION = config.getVersion();
const PORT = config.getPort();

console.log(`SevDesk-Extension for Theologische Fernschule e.V. running on Version: ${VERSION}`)
console.log('Trying to start the server...')


// Options for the FrontEnd to function properly
app.use(require('cors')({
    origin: '*',
    optionsSuccessStatus: 200,
    methods: "GET, PUT, POST"
}));
let donationData, year, donationsTotal;
let loadedData = fileHandler.loadStatusFromFile();

if (loadedData) {
    donationData = loadedData.Data;
    year = loadedData.Year;
    donationsTotal = loadedData.DonationsTotal;
}

// app.get('/', (req, res) => {
//     res.send({
//         "Status": "running",
//         "Message": "Invalid Branch. Use '/fetchNew?year=...' to get all Donations to the input year Use '/saveData?data=...' to save the input Data to a json file"
//     });
// });
app.get('/kill', (req, res) => {
    console.log('The Server will Shutdown with ExitCode 1');
    res.send({"Status":"shutdown"});
    process.exit()
});

app.get('/api/saveToken', (req,res) => { // /saveToken?token=...
    let response = fileHandler.writeDotEnvToken(req.query.token);
    res.send(response);
    console.log(response);
})


app.get('/api/fetchNew', (req, res) => { // /fetchNew?year=...
    func.fetchNew(req.query.year).then((data) => {
        year = data.Year;
        donationData = data.Data;
        donationsTotal = data.DonationsTotal;
        res.send(data);
    });
})

app.get('/api/saveData', (req, res) => {
    let response = fileHandler.saveStatusToFile(donationData, year, donationsTotal);
    res.send(response);
    console.log(response);
});
app.get('/api/loadData', (req, res) => {
    res.send({ "Year": year, "DonationsTotal": donationsTotal, "Data": donationData});
});

app.get('/api/deleteDonator', (req, res) => { // /deleteDonator?donatorIDs=1-2-3-...
    let hasErrorOccured = false;
    let workingData = donationData;
    let userID = func.getMultipleUserIDs(req.query.donatorIDs);
    for(let i = 0; i < userID.length; i++) {
        if(donationData[userID[i]]) delete workingData[userID[i]];
        else hasErrorOccured = true;
    }
    res.send(hasErrorOccured ? {"Status": 400, "Response": "Error: Specified User does not exist"} : workingData);
    donationData = workingData;
});
app.get('/api/moveDonator', (req, res) => { // /moveDonator?donatorIDs=1-2-3-...
    let userID = func.getMultipleUserIDs(req.query.donatorIDs);
    for(let i = 0; i < userID.length; i++) {
        if(donationData[userID[i]].Status != 2) donationData[userID[i]].Status ++;
    }
    res.send(donationData);
})

app.get('/api/createLatex', (req, res) => {
    let latexElements = [];
    for(const key in donationData) {
        if(donationData[key].Status == 1) latexElements.push(donationData[key]);
    }
    if(latexElements.length == 0) {
        let response = {"Status": 400, "Response": "No Donations to create LaTeX-File"} 
        res.send(response);
        console.log(response);
        
    } else {
        let response = fileHandler.writeTexDoc(out.createTexDocument(latexElements, year));
        res.send(response);
        console.log(response);
    }
});

app.get('/api/refetchUsers', (req, res) => { // /refetchUsers?donatorIDs=1-2-3-...
    func.refetchUsers(req.query.donatorIDs, year, donationData).then((data) => {
        res.send(data);
    });
})

app.listen(PORT, function(){  
    console.log(`Server running on Port ${PORT}`);
});