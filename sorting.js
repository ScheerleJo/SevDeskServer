DocumentType = module;

const request = require('./requests');

let data = [];
let countError = new Array();

module.exports = {
    setDonationData,
    listDonationsPerUserID,
    deleteItemAtIndex
}

function setDonationData(APIData) {
    data = APIData;
}

/**
 * sort all Donations from 'setData' by objects.supplier.customernumber & date from oldest to newest
 * @returns {Array<String>} Sorted donations
 */
function listDonationsPerUserID() {
    countError = [];
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
 * @returns 
 */

/**
 * walk thru all donation objects to get smallest customerNumber
 * @returns {Array<Number>} JSON-Object of smallest CustomerNumber and the first listed Index of that Number
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
 * Description
 * @param {any} deleteInfo
 * @returns {Array<JSON>} manipulated Array with deleted Item At Index
 */
function deleteItemAtIndex(deleteInfo) {
    let donatorIndex = deleteInfo[0];
    let donationIndex = deleteInfo[1];
    let deleteAll = deleteInfo[2];
    if(deleteAll) {
        return [];
    }
    if (!donationIndex) {
        //delete whole donator
        delete data[donatorIndex];
    } else {
        //delete only single Donation
        delete data[donatorIndex].Donations[donationIndex];
    }
    return data;
}