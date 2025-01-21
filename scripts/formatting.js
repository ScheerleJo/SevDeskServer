DocumentType = module;
const num2words = require('num-words-de');
const Template = require('./template');
const template = new Template();

module.exports = {
    setAddressData,
    mergeDonators,
    getDonationsTotal,
    correctSum
}

var addresses = [];

/**
 * Set the Address Data for the Donators
 * @param {Array<JSON>} APIData the data from the API
 */
function setAddressData(APIData) {
    addresses = APIData.objects;
}

/**
 * Format and merge the data to push to Frontend
 * @param {Array<JSON>} data the data from the API
 * @returns {Array<JSON>} the merged data 
 */
function mergeDonators(data, oldData = undefined) {
    let errorUsers = [];
    let allDonatorsSum = 0;
    let users = oldData || {};
    for(let i = 0; i < data.length; i++) {
        try{
            const id = data[i].supplier.id;
            if(!users[id]) {
                users[id] = template.donator();
                users[id].id = id;
                users[id].status = 'unchecked';
                users[id].academicTitle = data[i].supplier.academicTitle || "";
                let correctedNames = checkDonatorName(data[i]);
                if (correctedNames.error) users[id].status = 'error';
                users[id].surename = correctedNames.surename;
                users[id].familyname = correctedNames.familyname
                let address = getAddressForContact(id);
                if(address.error) users[id].status = 'error';
                users[id].address = address.newAddress;
            }
            users[id].totalSum += parseFloat(data[i].sumNet);
            users[id].donations.unshift(createNewDonation(data[i]));
        } catch (error) {
            console.error(`Information Error: No supplier was linked to the Voucher with the Voucher-ID: ${data[i].id}`);
            let user = template.donator();
            let correctedNames = checkDonatorName(data[i]);
            user.status = 'error';
            user.surename = correctedNames.surename;
            user.familyname = correctedNames.familyname
            user.totalSum = data[i].sumNet;
            user.donations.unshift(createNewDonation(data[i]));
            errorUsers.push(user);            
        }
        allDonatorsSum += parseFloat(data[i].sumNet);
    }
    console.log("Count of users with errors: " + errorUsers.length);
    for(let i = 0; i < errorUsers.length; i++) {
        users["errorUser" + i] = errorUsers[i];
    }
    for (const key in users) {
    if(!users[key].sumInWords){
        users[key].sumInWords = convertNumToWord(users[key].totalSum); //Needs to be done before sum is modified to currency string
        users[key].totalSum = correctSum(users[key].totalSum);
    }
    }
    if(getDonationsTotal(data) !== allDonatorsSum) console.error("Error: Sum of all Donations does not match the sum of all merged Donators!\nThe sum is currently " + allDonatorsSum + " and should be " + getDonationsTotal(data));
    return users;
}

/**
 * Create a new Donation Object
 * @param {JSON} element the element from the API
 * @returns {JSON} the new Donation Object
 */
function createNewDonation(element) {
    let newDonation = template.donation();
    newDonation.date = new Date(element.voucherDate).toLocaleDateString('de-DE');
    newDonation.sum = correctSum(element.sumNet);
    newDonation.id = element.id;
    return newDonation;
}

/**
 * Check the Names of the Donators
 * @param {JSON} element the element from the API
 * @returns {JSON} the corrected Names
 */
function checkDonatorName(element) {
    if(element.supplier) {
        let familyname = element.supplier.familyname || "";
        let surename = element.supplier.surename || "";
        let name = element.supplier.name || "";
    
        if (familyname && surename) return { "familyname": familyname, "surename": surename, error: false }
        console.warn(`Information Warning: Name with ID ${element.supplier.id} might be incomplete!`);
        if (name) return { "surename": "", "familyname": name, error: true} //? not entirely true but this allows easier access to the "backup"-name
    }
    if (element.supplierName) return { "surename": "", "familyname": element.supplierName }
    return { "familyname": "", "surename": "", error: true }
}

/**
 * Convert a Number to a a currency word
 * @param {Number} num_f the number to convert
 * @returns {String} the number as a currency word
 */
function convertNumToWord(num_f) {
    let euro = num2words.numToWord(parseInt(num_f), {indefinite_ein:true});
    let cent =  num2words.numToWord((num_f % 1).toFixed(2).substring(2), {indefinite_ein:true});
    if (num_f < 1) return cent + ' Cent';
    else if (num_f % 1 == 0) return euro;
    return euro + ' Euro ' +  cent;
}

/**
 * Get the Address for the Contact
 * @param {Number} id the ID of the Contact
 * @returns {JSON} the Address
 */
function getAddressForContact(id) {
    let found = addresses.find((address) => address.contact.id == id);
    let error = false;
    if(!found) {
        console.error(`Information Error: No matching Address found at ID ${id}!`);
        return {undefined, error: true};
    }
    if(!found.street || !found.zip || !found.city || !found.country.name) {
        console.warn(`Information Warning: Address with ID ${found.id} is incomplete!`); 
        error = true;
    }

    let newAddress = template.address();
    newAddress.street = found.street || "";
    newAddress.zip = found.zip || "";
    newAddress.city = found.city || "";
    newAddress.country = found.country.name || "";
    return {newAddress, error};
}

/**
 * Correct the Sum to a currency string
 * @param {Number} sum_f the sum to correct
 * @returns {String} the corrected sum
 */
function correctSum(sum_f){
    if (typeof sum_f == 'string') sum_f = parseFloat(sum_f);
    return sum_f.toLocaleString('de-DE', { style: 'currency',  currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2});
}

/**
 * Get the total sum of all donations
 * @param {Array<JSON>} data the data from the API
 * @returns {Number} the total sum of all donations
 */
function getDonationsTotal(data) {
    let actualTotalSum = 0;
    for(let i = 0; i < data.length; i++) {
        actualTotalSum += parseFloat(data[i].sumNet);
    }
    return actualTotalSum;
}