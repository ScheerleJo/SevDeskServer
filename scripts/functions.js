module.exports = {
    fetchNew,
    refetchUser,
    addNewUsers,
    getMultipleUserIDs
}

const requests = require('./requests');
const formatting = require('./formatting');

/**
 * Fetch new Data from the API and return it
 * @param {Request} req the request from the frontend
 * @returns {JSON} the new Data
 */
async function fetchNew(year) {
    let data = await requests.getDonations(year)
    console.log('DATA GATHERING (Donations) COMPLETE')
    formatting.setAddressData(await requests.getAllAddresses());
    console.log('DATA GATHERING (Addresses) COMPLETE')
    let mergedData = await formatting.mergeDonators(data.objects);
    let actualSum = await formatting.getDonationsTotal(data.objects);
    return {
        "year": year,
        "donationsTotal": formatting.correctSum(actualSum),
        "data": mergedData,
        "total": mergedData.length
    }
}

/**
 * Add new Users from the API and update the donationData 
 * @param {Number} year the year of the donations
 * @param {Array<JSON>} donationData the old data 
 * @returns {Array<JSON>} the updated data
 */
async function addNewUsers(year, donationData) {
    let newData = await requests.getDonations(year)
    formatting.setAddressData(await requests.getAllAddresses());
    let mergedData = formatting.mergeDonators(newData.objects);

    //Indexes for new elements in old 'donationData'-Array
    for (let i = 0; i < mergedData.length; i++) {
        if (!donationData.includes(mergedData[i])) {
            donationData.push(mergedData[i]);
        }
    }
    return donationData;    
}

async function refetchUser(year, user, donationData) {
    let userID = parseInt(user);
    let data = await requests.getDonations(year, user);
    let mergedData = await formatting.mergeDonators(data.objects);
    donationData[userID] = mergedData;
    return donationData;
}

/**
 * Split multiple concatenated UserIDs from a request 
 * @param {String} string concatenated ids from request
 * @returns {Array<Number>}
 */
function getMultipleUserIDs(ids) {
    ids = ids.split('-');
    for(let i = 0; i < ids.length; i++) {
        if(typeof(ids[i]) != "number") ids[i] = parseInt(ids[i]);
    }
    return ids;
}