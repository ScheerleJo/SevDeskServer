const express = require('express');
var app = express();
const PORT = 8040;
const requests = require('./requests');
const out = require('./output');


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
            console.log(response);
            
            res.send(response);
        })
        
    })

    
});
app.get('/saveData', (req, res) => {

});

app.listen(PORT, function(){        
    console.log(`Server running on Port ${PORT}`);
});