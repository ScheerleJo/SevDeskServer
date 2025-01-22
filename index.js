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
let donationData, year;
let loadedData = fileHandler.loadStatusFromFile();

if (loadedData) {
    donationData = loadedData.data;
    year = loadedData.year;
}

app.get('/ping', (req, res) => {
    console.log("Ping from " + req.ip);
    res.send({"status":"pong"});
});
app.get('/kill', (req, res) => {
    console.log('The Server will Shutdown with ExitCode 1');
    res.send({"status":"shutdown"});
    process.exit()
});

app.get('/getVersion', (req, res) => {
    console.log('Requesting the current Version...');
    res.send({"version": VERSION});
});

app.get('/api/saveToken', (req,res) => { // /saveToken?token=...
    console.log('Trying to save the new API-Token...');
    let response = fileHandler.writeDotEnvToken(req.query.token);
    res.send(response);
    console.log(response);
})

app.get('/api/fetchNew', (req, res) => { // /fetchNew?year=...
    console.log('Fetching new Data for the year: ' + req.query.year);
    func.fetchNew(req.query.year).then((data) => {
        year = data.year;
        donationData = data.data;
        res.send(data);
    }).catch((error) => {
        console.log(error)
        res.send({'error': error.message});  
    });
})

app.get('/api/saveData', (req, res) => {
    console.log('Trying to save the current status...');
    let response = fileHandler.saveStatusToFile(donationData, year, func.getAdditionalInfo(donationData));
    res.send(response); // {"status": 201, "response": "Data Saved Successfully!"}
    console.log(response);
});
app.get('/api/loadData', (req, res) => {
    console.log('Trying to load the current status...');
    // let response = fileHandler.loadStatusFromFile();
    res.send({ "year": year, "data": donationData, 'additionalInfo': func.getAdditionalInfo(donationData)});
});

app.get('/api/loadDataFromFile', (req, res) => {
    console.log('Trying to load the current status...');
    res.send(fileHandler.loadStatusFromFile());
});

app.get('/api/moveDonator', (req, res) => { // /moveDonator?donatorID=1&status=checked
    console.log('Moving User with ID: ' + req.query.donatorID + ' to status: ' + req.query.status);
    donationData[req.query.donatorID].status = req.query.status;    // unchecked, checked, checkedNotInPool, done, error 
    res.send({ "year": year, "data": donationData, 'additionalInfo': func.getAdditionalInfo(donationData)});
})

app.get('/api/createLatex', (req, res) => {
    let latexElements = {};
    for(const key in donationData) { 
        if(donationData[key].status == 'checked') latexElements[key] = donationData[key];
    }
    if(!latexElements) {
        let response = {"status": 400, "response": "No Donations to create LaTeX-File"} 
        res.send(response);
        console.log(response);
    } else {
        let response = fileHandler.writeTexDoc(out.createTexDocument(latexElements, year));
        res.send(response); // {"status": 201, "response": "LaTeX-File Created Successfully!"}
        console.log(response);
    }
});
app.get('/api/getLatex', (req, res) => {
    console.log('Trying to download the LaTeX-File...');
    if(fileHandler.checkTexFile()) res.download(__dirname + '/main.tex');
    else res.send({"status": 404, "response": "No LaTeX-File found"});
});

app.get('/api/refetchDonator', (req, res) => { // /refetchUsers?donatorID=1
    console.log('Refetching User with ID: ' + req.query.donatorID);
    func.refetchUser(year, req.query.donatorID, donationData).then((data) => {
        donationData = data;
        res.send({ "year": year, "data": donationData, 'additionalInfo': func.getAdditionalInfo(donationData)});
    });
});

app.get('/api/deleteDonator', (req, res) => { // /deleteDonator?donatorID=1
    console.log('Deleting User with ID: ' + req.query.donatorID);
    delete donationData[req.query.donatorID];
    res.send({ "year": year, "data": donationData, 'additionalInfo': func.getAdditionalInfo(donationData)});
});

app.get('/api/addNewDonators', (req, res) => { // /addNewDonators
    console.log('Searching for new Users in the year: ' + year);
    func.addNewUsers(year, donationData).then((data) => {
        donationData = data;
        res.send({ "year": year, "data": donationData, 'additionalInfo': func.getAdditionalInfo(donationData)});
    });
})

app.listen(PORT, function(){  
    console.log(`Server running on Port ${PORT}`);
});