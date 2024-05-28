// Description: This file contains the sorting and deleting functions for the donations

var donationData = [];

module.exports = {
    setDonationData,
    listDonationsPerCN,
    filterUsersPerID,
    deleteUserAtID,
    getIndexesforUserID
}

function setDonationData(APIData) {
    donationData = APIData;
}

/**
 * sort all Donations from 'setData' by objects.supplier.customernumber & date from oldest to newest
 * @returns {Array<String>} Sorted donations
 */
function listDonationsPerCN(specificData = undefined) {
    var activeData = specificData == undefined ? donationData : specificData;
    activeData.sort((a, b) => {
        if (a.supplier.customerNumber > b.supplier.customerNumber || a.supplier.customerNumber == undefined) {
            return 1;
        } else if (a.supplier.customerNumber < b.supplier.customerNumber || b.supplier.customerNumber == undefined) {
            return -1;
        }
        return 0;
    });
    return activeData;
}

function filterUsersPerID(data, IDs) {
    let filteredData = [];
    for (let i = 0; i < data.length; i++) {
        if (IDs.includes(data[i].supplier.customerNumber)) {
            filteredData.push(data[i]);
        }
    }
    return filteredData;
}

function getIndexesforUserID(data, IDs) {
    let indexes = [], index;
    for (let i = 0; i < IDs.length; i++) {
        index = -1;
        data.find((item, j) => {
            if(item.ID === IDs[i]) index = j;
        });
        indexes.push(index);
    }
    return indexes;
}

/**
 * Deletes the Item at the spcified Index. It is possible to delete Donators or Donations or clear the entire Array
 * @param {Array<Number>} userID ID of the Donator from SevDesk
 * @returns {Array<JSON>} manipulated Array with deleted Item At Index
 */
function deleteUserAtID(userID) {
    let donatorIndexes = getIndexesforUserID(userID);
    for(let i = 0; i < donatorIndexes.length; i++) {
        try {
            if(donatorIndexes[i] != -1) {
                donationData.splice(donatorIndexes[i], 1);
            } else throw ReferenceError('UserID could not be found');
        } catch(error) {
            console.error(error);
            return 400;
        }
    }
    return donationData;
}