const express = require('express');
var app = express();
const PORT = 8040;
const requests = require('./requests');
const sort = require('./sorting');


app.get('/', (req, res) => {
    requests.getDonations(2023, function() {
        // console.log('DATA GATHERING COMPLETE')
        sort.setData(requests.getData());
        console.log(sort.listDonationsPerUserID());

    })
})

app.listen(PORT, function(){        
    console.log(` Server running on Port ${PORT}`);
});