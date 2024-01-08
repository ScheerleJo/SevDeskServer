const config = require('./scripts/configHandling')
const requests = require('./scripts/requests');
const formatting = require('./scripts/formatting');
const sort = require('./scripts/sorting');
const fileHandler = require('./scripts/fileHandling');
const urlHandler = require('./scripts/urlHandling');
const out = require('./scripts/output');

const process = require('node:process');
const express = require('express');
const cors = require('cors');
var app = express();

const VERSION = config.VERSION;
const PORT = config.PORT;

console.log(`SevDesk-Extension for Theologische Fernschule e.V. running on Version: ${VERSION}`)
console.log('Trying to start the server...')

let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
    methods: "GET, PUT, POST"
}

// Options for the FrontEnd to function properly
app.use(cors(corsOptions));
let donationData, year;
let loadedData =  fileHandler.loadStatusFromFile();

if (loadedData != undefined) {
    donationData = loadedData.Data;
    year = loadedData.Year;
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
    let token = urlHandler.getToken(req.url);
    console.log(token);
    fileHandler.writeDotEnvToken(token);
    res.send({
        "Status": 200
    })
})

app.get('/fetchNew', (req, res) => {
    year = urlHandler.getYearFromQuery(req.url)
    requests.getDonations(year, () => {
        console.log('DATA GATHERING (Donations) COMPLETE')
        formatting.setDonationData(requests.getData());
        requests.getAllAddresses(() => {
            console.log('DATA GATHERING (Addresses) COMPLETE')
            formatting.setAddressData(requests.getAddressData());
            donationData = formatting.newFormat();
            console.log('DATA PUSHED SUCCESSFULLY');
            res.send({
                "Year": year,
                "Data": donationData
            });
        })
    })
})

app.get('/saveData', (req, res) => {
    let response = fileHandler.saveStatusToFile(donationData, year);
    res.send({"Status": response});     //  Send Status Code (200 for everything okay)
    console.log('SAVE-DATA STATUS: ' + response)
});
app.get('/loadData', (req, res) => {
    res.send({
        "Year": year,
        "Data": donationData
    });
});

app.get('/deleteItem', (req, res) => { ///deleteItem?donatorIndex=...(num)&donationIndex=...(num)&deleteAll=...(true/false)
    sort.setDonationData(donationData);
    
    donationData = sort.deleteItemAtIndex(urlHandler.getDeleteItem(req.url));
    res.send(donationData);
});
app.get('/moveItem', (req, res) => {
    sort.setDonationData(donationData);
    let index = urlHandler.getMoveItem(req.url);
    if(donationData[index].Status != 2) donationData[index].Status ++;
    res.send(donationData);
})

app.get('/createLatex', (req, res) => {
    out.setYear(year);
    let latexElements = [];
    for(let i = 0; i < donationData.length; i++) {
        if(donationData[i].Status == 1) {
            latexElements.push(donationData[i]);
        }
    }
    out.setData(latexElements);
    let output = out.createTexDoc();
    let success = fileHandler.writeTexDoc(output);
    if (success != 200) res.send(success); 
    else  {
        res.send({
            "Status": 200,
            "response": "LaTeX File Created Successfully!"
        })
        console.log("LaTeX-FILE SUCCESSFULL CREATED")
    }
});

app.listen(PORT, function(){  
    console.log(`Server running on Port ${PORT}`);
});