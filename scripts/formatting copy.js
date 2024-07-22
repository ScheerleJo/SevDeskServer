DocumentType = module;
const num2words = require('num-words-de');
const sort = require('./sorting');

module.exports = {
    setDonationData,
    setAddressData,
    newFormat,
}

var sortedData = [];
var addresses = [];

function setDonationData(data) {
    sort.setDonationData(data.objects);
    sortedData = sort.listDonationsPerCN();
}
function setAddressData(APIData) {
    addresses = APIData.objects;
}

/**
 * Format the data sorted by this module to push to Frontend
 * Format = [[status, customernumber, title, firstName, lastName, streetNumber, postalCodeCity, donationSumAll, [['donationDate', 'type', 'description', 'donationSum', donationSumAsText], ...nextDonation], state],...nextUser]
 * @returns formattedData Array<String>
 */
function newFormat() {
    let len = sortedData.length;
    let donatorData;
    let lastCustomerNumber = 0, customerNumber = 0;
    let i = 0;
    while(i < len) {
        const element = sortedData[i];
        try {
            customerNumber = parseInt(element.supplier.customerNumber);
            if (lastCustomerNumber != customerNumber){
                lastCustomerNumber = customerNumber;
                finalizeDonator(donatorData, i)
                donatorData = getNextDonator(element);
                i++;
            } else {
                sortedData.splice(i, 1);
                len--;
            }
        } catch (error) {
            console.error('User Information not Complete at Item ' + i + ' with ID: ' + element.id);
            finalizeDonator(donatorData, i);
            donatorData.Familyname = element.supplierName.split(" ")[element.supplierName.split(" ").length - 1];
            donatorData.Surename = element.supplierName.replace(' ' + donatorData.Familyname, '');
            donatorData.CustomerNumber = "Error, Kunde ist nicht vollständig!";
            i++;
        }
        donatorData.Donations.unshift(getNextDonation(element))
        DonatorData.TotalSum += parseFloat(element.sumNet);
    }
    sortedData.splice(0, 1);
    return sortedData;
}

function finalizeDonator(donatorData, i) {                
    if (donatorData) {
        donatorData.SumInWords = convertNumToWord(donatorData.TotalSum);
        donatorData.TotalSum = correctSum(donatorData.TotalSum);
        sortedData[i] = donatorData;
    }
}

function getNextDonator(element) {
    let address = getAddressForContact(element.supplier.id) || false;
    return {
        "ID": element.supplier.id,
        "Status": 0,
        "CustomerNumber":element.supplier.customerNumber.trim() || '',
        "AcademicTitle": element.supplier.academicTitle.trim() || '',
        "Surename": element.supplier.surename.trim() || '',
        "Familyname": (element.supplier.familyname == null ? "": element.supplier.familyname.trim()),
        "Street": address.street.trim() || '',
        "ZipCity": !address ? '' : `${address.zip.trim()} ${address.city.trim()}`,
        "Country": address.country.name.trim() || '',
        "TotalSum": 0,
        "SumInWords": '',
        "Donations": []
    }
}
function getNextDonation(element) {
    return {
        "Date": new Date(element.voucherDate).toLocaleDateString('de-DE'),
        "Type": "Geldzuwendung",
        "Waive": "nein",
        "Sum": correctSum(element.sumNet),
    }
}

function convertNumToWord(num_f) {
    let euro = num2words.numToWord(parseInt(num_f), {indefinite_ein:true});
    let cent =  num2words.numToWord((num_f % 1).toFixed(2).substring(2), {indefinite_ein:true});
    if (num_f < 1) return cent + ' Cent';
    else if (num_f % 1 == 0) return euro;
    return euro + ' Euro ' +  cent;
}

function getAddressForContact(id) {
    for (let i = 0; i < addresses.length; i++){
        if(addresses[i].contact.id == id){
            const address = addresses[i];
            if(address && (!address.street || !address.zip || !address.city || !address.country.name)){
                console.warn(`Information Warning: Address with ID ${address.id} is incomplete!`);
            }
            return address;
        }
    }
    console.error(`Information Error: No matching Address found at ID ${id}!`);
}


function correctSum(sum){
    // if (typeof sum == 'string') sum = parseFloat(sum);
    return sum.toLocaleString('de-DE', { style: 'currency',  currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2});
    // console.error("Value: " + sum_f + ", DataTye: " + typeof sum_f + ", Corrected: " + sum_f.toLocaleString('de-DE', { style: 'currency',  currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2}));
}