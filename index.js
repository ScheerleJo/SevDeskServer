const express = require('express');
var app = express();
const PORT = 8040;

var requests = require('./requests');



app.get('/', (req, res) => {
    requests.getDonations(2023)
})



app.listen(PORT, function(){        
    console.log(` Server running on Port ${PORT}`);
});

