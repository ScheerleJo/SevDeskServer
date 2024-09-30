const config = new (require('./scripts/configuration'))();
const fileHandler = require('./scripts/fileIO');
const urlHandler = require('./scripts/urlParser');
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

app.get('/', (req, res) => {
    res.send({
        "Status": "running",
        "Message": "Invalid Branch. Use '/fetchNew?year=...' to get all Donations to the input year Use '/saveData?data=...' to save the input Data to a json file"
    });
});
app.get('/kill', (req, res) => {
    console.log('The Server will Shutdown with ExitCode 1');
    res.send({"Status":"shutdown"});
    process.exit()
});

app.get('/saveToken', (req,res) => {
    fileHandler.writeAPIToken(urlHandler.getToken(req.url));
    res.send({"Status": 200})
})

app.get('/fetchNew', (req, res) => {
    func.fetchNew(req).then((data) => {
        year = data.Year;
        donationData = data.Data;
        donationsTotal = data.DonationsTotal;
        res.send(data);
    });
})

app.get('/saveData', (req, res) => {
    let response = fileHandler.saveStatusToFile(donationData, year, donationsTotal);
    res.send({"Status": response});     //  Send Status Code (200 for everything okay)
    console.log('SAVE-DATA STATUS: ' + response)
});
app.get('/loadData', (req, res) => {
    res.send({ "Year": year, "DonationsTotal": donationsTotal, "Data": donationData});
});

app.get('/deleteDonator', (req, res) => { ///deleteDonator?donatorIDs=1-2-3-...
    let userID = urlHandler.getMultipleUserIDs(req.url);
    for(let i = 0; i < userID.length; i++) {
        if(donationData[userID[i]]) delete donationData[userID[i]];
        else {
            res.send({"Status": 400, "Response": "Error while deleting Donator"})
            throw ReferenceError('UserID could not be found');
        }
    }
    res.send(donationData);
});
app.get('/moveDonator', (req, res) => {
    let ids = urlHandler.getMultipleUserIDs(req.url);
    for(let i = 0; i < ids.length; i++) {
        if(donationData[ids[i]].Status != 2) donationData[ids[i]].Status ++;
    }
    res.send(donationData);
})

app.get('/createLatex', (req, res) => {
    let latexElements = [];
    for(let i = 0; i < donationData.length; i++) {
        if(donationData[i].Status == 1) latexElements.push(donationData[i]);
    }
    if(latexElements.length == 0) {
        res.send({"Status": 400, "Response": "No Donations to create LaTeX-File"})
        return;
    }
    let success = fileHandler.writeTexDoc(out.createTexDocument(donationData, year));
    if (success != 201) res.send({"Status": success,"Response": "Error while creating LaTeX-File"}); 
    else {
        res.send({"Status": success,"Response": "LaTeX-File Created Successfully!"})
        console.log("LaTeX-FILE SUCCESSFULL CREATED")
    }
});

app.get('/refetchUsers', (req, res) => {
    oldData = donationData;
    func.refetchUsers(req, year, donationData).then((data) => {
        res.send(data);
    });
})

app.listen(PORT, function(){  
    console.log(`Server running on Port ${PORT}`);
});