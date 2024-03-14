DocumentType = module;
const num2words = require('num-words-de');
const sort = require('./sorting');

module.exports = {
    setDonationData,
    setAddressData,
    newFormat,
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
                "CustomerNumber": (element.supplier.customerNumber).trim(),
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
    console.log(`Information Error: No matching Address was returned at ID ${element.supplier.id}! At output.js:68`);

}
function getNextDonation(element) {
    totalSum += parseFloat(element.sumNet);
    return {
        "Date": new Date(element.voucherDate).toLocaleDateString('de-DE'),
        "Type": "Geldzuwendung",
        "Waive": "nein",
        "Sum": correctSum(element.sumNet),
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
    let euro = num2words.numToWord(parseInt(num_f), {indefinite_ein:true})
    let cent =  num2words.numToWord((num_f % 1).toFixed(2).substring(2), {indefinite_ein:true});
    
    if (num_f < 1) return cent + ' Cent';
    else if (num_f % 1 == 0) return euro;
    return euro + ' Euro ' +  cent;
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
    if (typeof sum_f == 'string') {
        sum_f = parseFloat(sum_f);
    }
    return sum_f.toLocaleString('de-DE', { style: 'currency',  currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2});
    // console.error("Value: " + sum_f + ", DataTye: " + typeof sum_f + ", Corrected: " + sum_f.toLocaleString('de-DE', { style: 'currency',  currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2}));
}