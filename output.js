DocumentType = module;
const num2words = require('num-words-de');
const sort = require('./sorting');
const request = require('./requests');

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
    let lastCustomerNUmber = 0;
    let donator = -1 // important to have at -1 to avoid the first element in the array to be empty. 
    
    for (let i = 0; i < sortedData.length; i++) {
        const element = sortedData[i];
        let customerNumber = sortedData[i].supplier.customerNumber;
        if(customerNumber != lastCustomerNUmber){
            lastCustomerNUmber = customerNumber;
            donator++;
            let adress;
            request.getAdressByContactID(element.supplier.id, () => {
                //TODO: Need to get the specific stuff in let adress
            });
            formatData[donator] = [
                element.supplier.customerNumber,
                element.supplier.titel,          //TODO: May need to be changed. Can't check whether its titel or academicTitle
                element.supplier.surename,
                element.supplier.familyname,
                `${adress[0]} ${adress[1]}`,
                `${adress[2]} ${adress[3]}`,
                formatData[donator][6] += element.sumNet,
                []
            ]
        }    
        let donation = [
            element.voucherDate,
            element.type,                       //TODO: Non existent in the reduced sample-File
            element.description,
            element.sumNet,
            convertNumToWord(element.sumNet)
        ]
        formatData[donator][7].append(donation) //TODO: Append Array to Array in Array :) Dont know the syntax to append right now
    }

    return formatData;
}

function convertNumToWord(numInteger) {
    //Uppercase: Default True
    return num2words(numInteger)
}