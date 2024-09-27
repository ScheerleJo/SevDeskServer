module.exports = {
    fetchNew,
    // refetchUsers
}

const requests = require('./requests');
const formatting = require('./formatting');
const urlHandler = require('./urlParser');

async function fetchNew(req) {
    year = urlHandler.getYear(req.url)
    let data = await requests.getDonations(year)
    console.log('DATA GATHERING (Donations) COMPLETE')
    formatting.setAddressData(await requests.getAllAddresses());
    console.log('DATA GATHERING (Addresses) COMPLETE')
    let mergedData = await formatting.mergeDonators(data.objects);
    let actualSum = await formatting.getDonationsTotal(data.objects);
    return {
        "Year": year,
        "DonationsTotal": formatting.correctSum(actualSum),
        "Data": mergedData
    }
}

/*
async function refetchUsers(req, year, donationData) {
    let users = urlHandler.getMultipleUserIDs(req.url);

    formatting.setDonationData(await requests.getDonations(year, users.length == 1 ? users.ID[0] : undefined));
    formatting.setAddressData(await requests.getAllAddresses());
    let formattedData = formatting.newFormat();

    //Indexes for new elements in old 'donationData'-Array
    for (let i = 0; i < formattedData.length; i++) {
        if(indexes[i] == -1) {
            console.error(`Error while updating users. UserID ${formattedData[i].ID}`);
            continue;
        }
        donationData[indexes[i]] = formattedData[i];
    }
    return donationData;    
}*/