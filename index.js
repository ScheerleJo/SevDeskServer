const express = require('express');
var app = express();
const PORT = 8040;
const requests = require('./requests');
const out = require('./output');


app.get('/', (req, res) => {

});

app.get('/getDonations', (req, res) => {
    let year = requests.getYearFromQuery(req.url);
    requests.getDonations(2023, () => {
        // console.log('DATA GATHERING COMPLETE')

        let response = out.setSortedData(requests.responseData);
        // console.log(response);
        res.json(response);
    })
});
app.get('/saveData', (req, res) => {

});

app.listen(PORT, function(){        
    console.log(`Server running on Port ${PORT}`);
});