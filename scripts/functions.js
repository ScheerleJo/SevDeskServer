module.exports = {
    fetchNew,
    refetchUser,
    addNewUsers,
    getAdditionalInfo
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
    return {
        "year": year,
        "data": mergedData,
        "additionalInfo": getAdditionalInfo(mergedData)
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
    formatting.setAddressData(await requests.getAllAddresses());
    if(!user.includes(('errorUser'))) {
        let userID = parseInt(user);
        let data = await requests.getDonations(year, user);
        delete donationData[user];
        let mergedData = await formatting.mergeDonators(data.objects, donationData);
        donationData[userID] = mergedData[userID];
        return donationData;
    } else {
        let data = await requests.getDonations(year);
        for(let i = 0; i<data.objects.length; i++) {
            if(data.objects[i].id ==donationData[user].donations[0].id) {
                delete donationData[user];
                return await formatting.mergeDonators([data.objects[i]], donationData);
            }
        }
    }
}
function getAdditionalInfo(donationData) {
    let additionalInfo = {
        totalDonators: Object.keys(donationData).length,
        totalDonationSum: 0,
        checkedDonators: 0,
        checkedDonatorsNIP: 0
    }; //NIP = Not In Pool
    for (const key in donationData) {
        if (donationData[key].status == 'checked') additionalInfo.checkedDonators++;
        if (donationData[key].status == 'checkedNotInPool') additionalInfo.checkedDonatorsNIP++;
        additionalInfo.totalDonationSum += parseFloat(donationData[key].totalSum);
    }
    additionalInfo.totalDonationSum = formatting.correctSum(additionalInfo.totalDonationSum);
    return additionalInfo;
}