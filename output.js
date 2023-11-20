DocumentType = module;
const num2words = require('num-words-de');
const sort = require('./sorting');

module.exports = {
    formatData,
    setSortedData
}
let sortedData = [];

function setSortedData (data) {
    sort.setData(data);
    sortedData = sort.listDonationsPerUserID();
}

/**
 * Format the data sorted by this module to push to Frontend
 * Format = [[customernumber, title, firstName, lastName, streetNumber, postalCodeCity, donationSumAll, [['donationDate', 'type', 'description', 'donationSum', donationSumAsText], ...nextDonation], state],...nextUser]
 * @returns formattedData Array<String>
 */
function formatData (){
    
    let formattedData = [];
    for (let i = 0; i < sortedData.length; i++) {
        const element = sortedData[i];
    }

    return formatData;
}

function convertNumToWord(numInteger) {
    //Uppercase: Default True
    return num2words(numInteger)
}