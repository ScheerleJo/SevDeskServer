DocumentType = module;
const num2words = require('num-words-de');
const template = require('./template');
const { get } = require('config');

module.exports = {
    setDonationData,
    setAddressData,
    newFormat,
    getDonationsTotal
}

var sortedData = [];
var addresses = [];
var totalSum = 0;
var allDonatorsSum = 0;

function setDonationData(data) {
    sortedData = data;
}
function setAddressData(APIData) {
    addresses = APIData.objects;
}

/**
 * Format the data sorted by this module to push to Frontend
 * Format = [[ID, status, title, firstName, lastName, [streetNumber, ZIP-Code, City, Country], donationTotalSum, [['donationDate', 'type', 'description', 'donationSum', donationSumAsText], ...nextDonation]],...nextUser]
 * @returns formattedData Array<JSON>
 */
function newFormat() {
    let len = sortedData.length;
    let donatorData;
    let lastDonatorID = 0;
    let i = 0;
    while(i < len) {
        const element = sortedData[i];
        try {
            let donatorID = parseInt(element.supplier.id);
            if (lastDonatorID != donatorID){
                lastDonatorID = donatorID;
                if(donatorData) finalizeDonator(donatorData, i);
                donatorData = getNextDonator(element);
                i++;
            } else {
                sortedData.splice(i, 1);
                len--;
            }
        } catch (error) {
            console.error('ID not found at Item ' + i);
            if(donatorData) finalizeDonator(donatorData, i);
            donatorData = getNextDonator(element);
            i++;
        }
        donatorData.Donations.unshift(getNextDonation(element))
    }
    sortedData.splice(0, 1);
    return sortedData;
}

function finalizeDonator(donatorData, i) {                
    donatorData.TotalSum = correctSum(totalSum);
    donatorData.SumInWords = convertNumToWord(totalSum);
    sortedData[i] = donatorData;
    allDonatorsSum += totalSum;
}

function getNextDonator(element) {
    let newDonator = template.newDonator;
    if(element.supplier) {
        newDonator.ID = element.supplier.id;
        newDonator.AcademicTitle = element.supplier.academicTitle || "";
        newDonator.Surename = element.supplier.surename;
        newDonator.Familyname = element.supplier.familyname;
        newDonator.Address = getAddressForContact(element.supplier.id);
    } else {
        let familyname = element.supplierName.split(" ")[element.supplierName.split(" ").length - 1];
        newDonator.Surename = element.supplierName.replace(' ' + familyname, '') || "";
        newDonator.Familyname = familyname[-1] || "";
        newDonator.TotalSum = correctSum(element.sumNet);
    }
    totalSum = 0;
    return newDonator;
}

function getNextDonation(element) {
    totalSum += parseFloat(element.sumNet);
    let newDonation = template.donation;
    newDonation.Date = new Date(element.voucherDate).toLocaleDateString('de-DE');
    newDonation.Sum = correctSum(element.sumNet);
    return newDonation;
}


function convertNumToWord(num_f) {
    let euro = num2words.numToWord(parseInt(num_f), {indefinite_ein:true});
    let cent =  num2words.numToWord((num_f % 1).toFixed(2).substring(2), {indefinite_ein:true});
    if (num_f < 1) return cent + ' Cent';
    else if (num_f % 1 == 0) return euro;
    return euro + ' Euro ' +  cent;
}

function getAddressForContact(id) {
    let found = addresses.find((address) => address.contact.id == id);
    if(!found) {
        console.error(`Information Error: No matching Address found at ID ${id}!`);
        return undefined;
    }
    if(!found.street || !found.zip || !found.city || !found.country.name) console.warn(`Information Warning: Address with ID ${found.id} is incomplete!`);
    
    let newAddress = template.address;
    newAddress.Street = found.street || undefined;
    newAddress.Zip = found.zip || undefined;
    newAddress.City = found.city || undefined;
    newAddress.Country = found.country.name || undefined;
    return newAddress;
}

function correctSum(sum_f){
    if (typeof sum_f == 'string') sum_f = parseFloat(sum_f);
    return sum_f.toLocaleString('de-DE', { style: 'currency',  currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2});
    // console.error("Value: " + sum_f + ", DataTye: " + typeof sum_f + ", Corrected: " + sum_f.toLocaleString('de-DE', { style: 'currency',  currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2}));
}

function getDonationsTotal() {
    return allDonatorsSum;
}