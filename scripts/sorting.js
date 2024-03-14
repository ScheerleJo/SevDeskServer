// Description: This file contains the sorting and deleting functions for the donations

let data = [];

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
    data.sort((a, b) => {
        if (a.supplier.customerNumber > b.supplier.customerNumber || a.supplier.customerNumber == undefined) {
            return 1;
        } else if (a.supplier.customerNumber < b.supplier.customerNumber || b.supplier.customerNumber == undefined) {
            return -1;
        }
        return 0;
    });
    return data;
}

/**
 * Deletes the Item at the spcified Index. It is possible to delete Donators or Donations or clear the entire Array
 * @param {any} deleteInfo
 * @returns {Array<JSON>} manipulated Array with deleted Item At Index
 */
function deleteItemAtIndex(deleteInfo) {
    let donatorIndex = deleteInfo.donatorIndex;
    let donationIndex = deleteInfo.donationIndex;
    let deleteAll = deleteInfo.deleteAll;
    if(deleteAll) {
        return [];
    }
    if (!donationIndex || data[donatorIndex].Donations.length == 1) {
        //delete whole donator
        try {
            data.splice(donatorIndex, 1);
            return data
        } catch(error) {
            console.error(error);
            return 400;
        }
    } else if (!donatorIndex && !donationIndex && !deleteAll) {
        return 400;
    } else {
        //delete only single Donation
        try {
            data[donatorIndex].Donations.splice(donationIndex, 1);
            return data;
        } catch(error){
            console.error(error);
            return 400;
        }
    }
}