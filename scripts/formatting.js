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
function mergeDonators(data) {
    let errorUsers = [];
    let allDonatorsSum = 0;
    let user = {};
    for(let i = 0; i < data.length; i++) {
        try{
            const id = data[i].supplier.id;
            if(!user[id]) {
                user[id] = template.donator();
                user[id].ID = id;
                user[id].AcademicTitle = data[i].supplier.academicTitle || "";
                let correctedNames = checkDonatorName(data[i]);
                user[id].Surename = correctedNames.surename;
                user[id].Familyname = correctedNames.familyname
                user[id].Address = getAddressForContact(id);
                user[id].TotalSum += parseFloat(data[i].sumNet);
            }
            user[id].Donations.unshift(createNewDonation(data[i]));
        } catch (error) {
            console.error(`Information Error: No supplier was linked to the Voucher with the Voucher-ID: ${data[i].id}`);
            let user = template.donator();
            let correctedNames = checkDonatorName(data[i]);
            user.Surename = correctedNames.surename;
            user.Familyname = correctedNames.familyname
            user.TotalSum = data[i].sumNet;
            user.Donations.unshift(createNewDonation(data[i]));
            errorUsers.push(user);            
        }
        allDonatorsSum += parseFloat(data[i].sumNet);
    }
    console.log("Count of users with errors: " + errorUsers.length);
    for(let i = 0; i < errorUsers.length; i++) {
        user["errorUser" + i] = errorUsers[i];
    }
        for (const key in user) {
        user[key].SumInWords = convertNumToWord(user[key].TotalSum); //Needs to be done after sum is modified to currency string
        user[key].TotalSum = correctSum(user[key].TotalSum);
    }
    if(getDonationsTotal(data) !== allDonatorsSum) console.error("Error: Sum of all Donations does not match the sum of all merged Donators!\nThe sum is currently " + allDonatorsSum + " and should be " + getDonationsTotal(data));
    return user;
}

/**
 * Create a new Donation Object
 * @param {JSON} element the element from the API
 * @returns {JSON} the new Donation Object
 */
function createNewDonation(element) {
    let newDonation = template.donation();
    newDonation.Date = new Date(element.voucherDate).toLocaleDateString('de-DE');
    newDonation.Sum = correctSum(element.sumNet);
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
    
        if (familyname || surename) return { "familyname": familyname, "surename": surename, }
        console.warn(`Information Warning: Name with ID ${element.supplier.id} might be incomplete!`);
        if (name) return { "surename": "", "familyname": name } //? not entirely true but this allows easier access to the "backup"-name
    }
    if (element.supplierName) return { "surename": "", "familyname": element.supplierName }
    return { "familyname": "", "surename": "" }
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
    if(!found) {
        console.error(`Information Error: No matching Address found at ID ${id}!`);
        return undefined;
    }
    if(!found.street || !found.zip || !found.city || !found.country.name) console.warn(`Information Warning: Address with ID ${found.id} is incomplete!`);
    
    let newAddress = template.address();
    newAddress.Street = found.street || "";
    newAddress.Zip = found.zip || "";
    newAddress.City = found.city || "";
    newAddress.Country = found.country.name || "";
    return newAddress;
}

/**
 * Correct the Sum to a currency string
 * @param {Number} sum_f the sum to correct
 * @returns {String} the corrected sum
 */
function correctSum(sum_f){
    if (typeof sum_f == 'string') sum_f = parseFloat(sum_f);
    return sum_f.toLocaleString('de-DE', { style: 'currency',  currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2});
    // console.error("Value: " + sum_f + ", DataTye: " + typeof sum_f + ", Corrected: " + sum_f.toLocaleString('de-DE', { style: 'currency',  currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2}));
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