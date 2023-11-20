const express = require('express');
var app = express();
const PORT = 8040;
const requests = require('./requests');
const out = require('./output');


app.get('/', (req, res) => {
    requests.getDonations(2023, function() {
        // console.log('DATA GATHERING COMPLETE')
        out.setSortedData(requests.getData());
        console.log(sort.listDonationsPerUserID());

    })
})

app.listen(PORT, function(){        
    console.log(` Server running on Port ${PORT}`);
});