module.exports = {
    fetchNew,
    refetchUsers
}

const requests = require('./requests');
const formatting = require('./formatting');
const urlHandler = require('./urlHandling');
const sort = require('./sorting');

async function fetchNew(req) {
    year = urlHandler.getYear(req.url)
    let data = await requests.getDonations(year)
    console.log('DATA GATHERING (Donations) COMPLETE')
    formatting.setAddressData(await requests.getAllAddresses());
    console.log('DATA GATHERING (Addresses) COMPLETE')
    sort.setDonationData(data.objects);
    formatting.setDonationData(sort.sortDonationsPerID());
    let formattedData = await formatting.newFormat();
    return {
        "Year": year,
        "DonationsTotal": await formatting.getDonationsTotal(),
        "Data": formattedData
    }
}

async function refetchUsers(req, year, donationData) {
    let users = urlHandler.getMultipleUserIDs(req.url);

    formatting.setDonationData(await requests.getDonations(year, users.length == 1 ? users.ID[0] : undefined));
    formatting.setAddressData(await requests.getAllAddresses());
    let formattedData = formatting.newFormat();

    //Indexes for new elements in old 'donationData'-Array
    let indexes = sort.getIndexforUserID(donationData, userIDs);

    for (let i = 0; i < formattedData.length; i++) {
        if(indexes[i] == -1) {
            console.error(`Error while updating users. UserID ${formattedData[i].ID}`);
            continue;
        }
        donationData[indexes[i]] = formattedData[i];
    }
    return donationData;    
}