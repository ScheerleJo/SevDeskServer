DocumentType = module;

const request = require('./requests');

let data //, originalData = '';
let countError = new Array();

module.exports = {
    setDonationData,
    listDonationsPerUserID
}

function setDonationData(APIData) {
    // originalData = APIData;
    data = APIData;
}

/**
 * sort all Donations from 'setData' by objects.supplier.customernumber & date from oldest to newest
 * @returns {Array<String>} Sorted donations
 */
function listDonationsPerUserID() {
    countError = [];
    data = data.objects
    let sorted = []
    var len = data.length
    let smallestCustomerNumber = getSmallestCustomerNumber()
    let index = smallestCustomerNumber['index'];

    for (let i = index; len != 0 ;) {
        sorted.push(data[i]);
        len = deleteCurrentItem(i);
        smallestCustomerNumber = getSmallestCustomerNumber();
        i = smallestCustomerNumber["index"];
    }
    return sorted;
}


function deleteCurrentItem(index) {
    data.splice(index, 1);
    return data.length;
}

/**
 * walk thru all donation objects to get smallest customerNumber
 * @returns smallest CustomerNumber and the first listed Index of that Number
 */
function getSmallestCustomerNumber() {
    let smallestNum, currentNum = null;
    let len = data.length;
    let index = null;
    for (let i = 0; i < len; i ++) {
        try {
            currentNum = data[i].supplier.customerNumber;
        } catch (error) {
            if (countError.includes(data[i].id) == false) {
                countError.push(data[i].id);
                console.log("Warning at item " + i + " of 'data':\n" + error)
            } if(countError.length >= len) {
                return {smallestNum: undefined, index: len - 1};
            } 
            continue;
        }
        if (smallestNum == null || smallestNum > currentNum) {
            smallestNum = currentNum;
            index = i;
        } 
    }
    return {smallestNum, index};
}



/**
 * Format the data sorted by this module to push to Frontend
 * Format = [[customernumber, title, firstName, lastName, streetNumber, postalCodeCity, donationSumAll, [['donationDate', 'type', 'description', 'donationSum', donationSumAsText], ...nextDonation], state],...nextUser]
 * @returns formattedData Array<String>
 */
function formattttttData (){
    let formattedData = []
    let lastCustomerNumber = 0;
    // let donator = -1; // important to have at -1 to avoid the first element in the array to be empty. 
    
    for (let i = 0; i < sortedData.length; i++) {
        const element = sortedData[i];
        let customerNumber = sortedData[i].supplier.customerNumber || undefined;
        if(customerNumber != lastCustomerNumber && customerNumber != undefined) {
            if(lastCustomerNumber != 0) {
                formattedData.push(donatorData);
            }
            donatorData = [];
            
            lastCustomerNumber = customerNumber;
            // donator++;
            // let donatorData = getDonatorData(element, formattedData[0] == undefined ? 0 : formattedData[donator]['TotalSum']);

            
        } else if (customerNumber == undefined) {
            // donator++;
        } 
        else {
            console.log("Donator already exists. Adding Donation only."); //! Only Temporary
        }       
    }
    return formattedData;
}

function convertNumToWord(numInteger) {
    //Uppercase: Default True
    return num2words.numToWord(numInteger)
}
