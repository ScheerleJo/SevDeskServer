DocumentType = module;
const num2words = require('num-words-de');
const sort = require('./sorting');

module.exports = {
    setDonationData,
    setAddressData,
    newFormat,
    formatDate,
}
let sortedData = [];
let addresses = [];
let totalSum = 0;

function setDonationData (data) {
    sort.setDonationData(data.objects);
    sortedData = sort.listDonationsPerUserID();
}
function setAddressData(APIData) {
    addresses = APIData.objects
}

/**
 * Format the data sorted by this module to push to Frontend
 * Format = [[status, customernumber, title, firstName, lastName, streetNumber, postalCodeCity, donationSumAll, [['donationDate', 'type', 'description', 'donationSum', donationSumAsText], ...nextDonation], state],...nextUser]
 * @returns formattedData Array<String>
 */
function newFormat (){
    let len = sortedData.length;
    let thinnedData = [];
    let donatorData = {};
    let lastCustomerNumber = 0;

    for(let i = 0; i < len; i++) {
        const element = sortedData[i];
        let customerNumber = undefined
        try {
            customerNumber = parseInt(element.supplier.customerNumber);
        } catch (error) {
            console.log('CustomerNumber not found at Item ' + i);
        }
        if(customerNumber === undefined) {
            if(donatorData != {}) {
                donatorData.TotalSum = correctSum(totalSum);
                console.log("CN:" + donatorData.CustomerNumber + " Sum: " + donatorData.TotalSum)
                donatorData.SumInWords = convertNumToWord(totalSum);
                thinnedData.push(donatorData);
            }
            //Set DonatorData to Error with some Information of the Voucher
            donatorData = getDonatorErrorData(element)
        } else if (customerNumber != lastCustomerNumber){
            //check for new customerNumber to set a new Donator
            lastCustomerNumber = customerNumber;
            if(i != 0) { // Prevents from Pushing an empty first Object
                donatorData.TotalSum = correctSum(totalSum);
                donatorData.SumInWords = convertNumToWord(totalSum);
                thinnedData.push(donatorData);
            }
            //Create new Donator Scheme
            donatorData = getNextDonator(element);
        }
        //add Donation
        donatorData.Donations.push(getNextDonation(element))
    }
    return thinnedData;
}


function getNextDonator(element) {
    totalSum = 0;
    let address = getAddressForContact(element.supplier.id) || undefined;
    if (address !== undefined) {
        return {
                "Status": 0,
                "CustomerNumber": handleElement(element.supplier.customerNumber),
                "AcademicTitle": element.supplier.academicTitle == null ? "" : element.supplier.academicTitle,
                "Surename": element.supplier.surename == null ? element.supplier.name: element.supplier.surename,
                "Familyname": element.supplier.familyname == null ? "": element.supplier.familyname,
                "Street": (address.Street + '').trim(),
                "ZipCity": `${address.Zip} ${address.City}`.trim(),
                "Country": address.Country,
                "TotalSum": 0,
                "SumInWords": "",
                "Donations": []
            }
    }
    console.log(`Information Error: No matching Address was returned at ID ${element.supplier.id}! At output.js:83`);

}
function getNextDonation(element) {             //! Hardcoded, pls change in future
    totalSum += parseFloat(element.sumNet);
    return {
        "Date": formatDate(element.voucherDate),
        "Type": "Geldzuwendung",
        "Waive": "nein",
        "Sum": correctSum(element.sumNet),
        // "SumInWords": convertNumToWord(element.sumNet)
    }
}

function getDonatorErrorData (element) {
    let name = element.supplierName.split(" ");
    let surename = '', familyname = '';
    for (let j = 0; j < (name.length - 1); j++) {
        surename += ` ${familyname[j]}`;
    } 
    return {
        "Status": 0,
        "CustomerNumber": "Error, keine Kdnr registriert",
        "AcademicTitle": "",
        "Surename": surename,
        "Familyname": familyname[-1],
        "Street": "",
        "ZipCity": "",
        "TotalSum": correctSum(element.sumNet),
        "Donations": []
    }
}


function convertNumToWord(num_f) {
    if (num_f % 1 == 0){
        return num2words.numToWord(num_f);
    }
    let num_format = Number(num_f).toFixed(2);
    let split = (num_format + '').split('.');
    let retValue;
    if(split[0] == 0 ) {
        retValue = num2words.numToWord(split[1], {indefinite_ein:true}) + ' Cent'; 
    } else {
        retValue = num2words.numToWord(split[0], {indefinite_ein:true}) + ' Euro ' + num2words.numToWord(split[1], {indefinite_ein:true}); // + " Cent";
    }
    return retValue;

}
function handleElement(element) {
    element = element.trim();
    return element;
}

function formatDate(date) {
    let formattedDate = new Date(date);
    return `${formattedDate.getDate()}.${formattedDate.getMonth() + 1}.${formattedDate.getFullYear()}`
}


function getAddressForContact(id) {
    for (let i = 0; i < addresses.length; i++){
        if(addresses[i].contact.id == id) {
            const address = addresses[i];
            return {
                "Street": address.street,
                "Zip": address.zip,
                "City": address.city,
                "Country": address.country.name,
            }
        }
    }
    console.log(`Information Error: No matching Address found at ID ${id}! At output.js:144`);
}


function correctSum(sum_f){
    let sum_s;
    if(sum_f % 1 == 0) {                               // Check for Decimals
        sum_s = sum_f + ',00 €';
    } else {                             
        let temp = Number(sum_f).toFixed(2);           // Format to 2-Decimal-Digits
        sum_s = temp.replace('.', ',') + ' €';         // Format to correct German Euro-Format
    }
    return sum_s;
}