DocumentType = module;

const request = require('./requests');

let data, originalData = '';
let countError = new Array();

module.exports = {
    setData,
    listDonationsPerUserID
}

function setData(APIData) {
    originalData = APIData;
    data = APIData;
}
/**
 * sort all Donations from 'setData' by objects.supplier.customernumber & date from oldest to newest
 * @returns {Array<String>} Sorted donations
 */
function listDonationsPerUserID() {

    countError = [];
    data = data.objects
    let sorted = [], formattedData = [];
    var len = data.length
    let smallestCustomerNumber = getSmallestCustomerNumber()
    let index = smallestCustomerNumber['index'];
    let lastcustomerNumber = undefined;
    let TotalSum = 0;
    let firstIteration = true;
    for (let i = index; len != 0 ;) {
        if (smallestCustomerNumber['smallestNum'] === undefined){
            let name = data[i].supplierName.split(" ");
            let surename = "";
            for (let j = 0; j < (name.length - 1); j++) { surename += ( " " + name[i]); }
            sorted.push({"customerNumber": "Error, keine Kdnr registriert",
            "AcademicTitle": "",
            "Surename": surename,
            "FamilyName": name[-1],
            "Street": "",
            "CityPostalCode": "",
            "TotalSum": data[i].sumNet,
            "Donations": {}
        })
        }
        if (smallestCustomerNumber['smallestNum'] != lastcustomerNumber){
            console.log('Push latest Donator and create New with Donation');
            if(!firstIteration) {
                if (sorted == []){
                    sorted = formattedData;
                } else {
                    sorted.push(formattedData);
                }
            }
            firstIteration = false;
            // formattedData = [];
            totalSum = 0;

            request.getAdressByContactID(data[i].supplier.id, () => {
                
                let adress = request.getAdressData().objects;
                let formattedData = {
                    "CustomerNumber": data[i].supplier.customerNumber,
                    "AcademicTitle": data[i].supplier.academicTitle,
                    "Surename": data[i].supplier.surename,
                    "FamilyName": data[i].supplier.familyname,
                    "Street": adress.street,
                    "CityPostalCode": `${adress.zip} ${adress.city}`,
                    "TotalSum": curTotalSum += data[i].sumNet,
                    "Donations":[]
                }
            });
            lastCustomerNumber = smallestCustomerNumber['smallestNum'];
        } else {
            console.log('Only Donation Stuff');
            formattedData.Donations.push(getDonationData(data[i]));
        }
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
 * walk thru all donation objects to get smallest customerNumber
 * @returns smallest CustomerNumber and the first listed Index of that Number
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



function formatData(currentDataPack, sortedData){
    let formattedData = [];

    if(sortedData.includes(currentDataPack.supplier.customerNumber)){
        console.log("only push Donation array to donator")
    } else {
        console.log("Push donator Array to return. Clear Donator array and push Donator Info")
    }


    return formattedData;
}



























/**
 * Format the data sorted by this module to push to Frontend
 * Format = [[customernumber, title, firstName, lastName, streetNumber, postalCodeCity, donationSumAll, [['donationDate', 'type', 'description', 'donationSum', donationSumAsText], ...nextDonation], state],...nextUser]
 * @returns formattedData Array<String>
 */
function formattttttData (){
    let formattedData = []
    let lastCustomerNumber = 0;
    // let donator = -1; // important to have at -1 to avoid the first element in the array to be empty. 
    
    for (let i = 0; i < sortedData.length; i++) {
        const element = sortedData[i];
        let customerNumber = sortedData[i].supplier.customerNumber || undefined;
        if(customerNumber != lastCustomerNumber && customerNumber != undefined) {
            if(lastCustomerNumber != 0) {
                formattedData.push(donatorData);
            }
            donatorData = [];
            
            lastCustomerNumber = customerNumber;
            // donator++;
            // let donatorData = getDonatorData(element, formattedData[0] == undefined ? 0 : formattedData[donator]['TotalSum']);

            
        } else if (customerNumber == undefined) {
            // donator++;
       ;
        } 
        else {
            console.log("Donator already exists. Adding Donation only."); //! Only Temporary
        }       
    }
    return formattedData;
}

function convertNumToWord(numInteger) {
    //Uppercase: Default True
    return num2words.numToWord(numInteger)
}

function getDonationData(element) {
    return {
        "Date": element.voucherDate,
        "Type": element.description,
        "Sum": element.sumNet,
        "SumInWords": convertNumToWord(element.sumNet)
    }
}