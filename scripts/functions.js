module.exports = {
    fetchNew,
    refetchUsers,
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
        "Year": year,
        "DonationsTotal": formatting.correctSum(actualSum),
        "Data": mergedData,
        "Total": mergedData.length
    }
}

/**
 * Refetch specific Users from the API and update the donationData
 * @param {Request} req the request from the frontend
 * @param {Number} year the year of the donations
 * @param {Array<JSON>} donationData the old data 
 * @returns {Array<JSON>} the updated data
 */
async function refetchUsers(donatorIDs, year, donationData) {
    let users = getMultipleUserIDs(donatorIDs);

    let newData = await requests.getDonations(year, users.length == 1 ? users[0] : undefined)
    formatting.setAddressData(await requests.getAllAddresses());
    let mergedData = formatting.mergeDonators(newData.objects);

    //Indexes for new elements in old 'donationData'-Array
    for (let i = 0; i < users.length; i++) {
        if(!mergedData[users[i]]) {
            console.error('User with ID ' + users[i] + ' not found in new Data');
            continue;
        }
        donationData[users[i]] = mergedData[users[i]];
    }
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