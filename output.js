DocumentType = module;
const num2words = require('num-words-de');
const sort = require('./sorting');
const request = require('./requests');

module.exports = {
    setDonationData,
    setAddressData,
    newFormat
}
let sortedData = [];
let addresses = [];
let totalSum = 0;

function setDonationData (data) {
    sort.setDonationData(data);
    sortedData = sort.listDonationsPerUserID();
}
function setAddressData(APIData) {
    addresses = APIData.objects
}

/**
 * Format the data sorted by this module to push to Frontend
 * Format = [[customernumber, title, firstName, lastName, streetNumber, postalCodeCity, donationSumAll, [['donationDate', 'type', 'description', 'donationSum', donationSumAsText], ...nextDonation], state],...nextUser]
 * @returns formattedData Array<String>
 */
function newFormat (){
    let len = sortedData.length;
    let thinnedData = [];
    let donatorData = {};
    let lastCustomerNumber = 0;



    console.log("Data.Length: " +len)
    for(let i = 0; i < len; i++) {
        // console.log(`i: ${i}`)
        const element = sortedData[i];
        let customerNumber = undefined
        try {
            customerNumber = parseInt(element.supplier.customerNumber);
        } catch (error) {
            console.log('CustomerNumber not found at Item ' + i);
        }
        if(customerNumber === undefined) {
            if(donatorData != {}) {
                thinnedData.push(donatorData);
            }
            //Set DonatorData to Error with some Information of the Voucher
            // console.log("Error")
            donatorData = getDonatorErrorData(element)
        } else if (customerNumber != lastCustomerNumber){
            //check for new customerNumber to set a new Donator
            lastCustomerNumber = customerNumber;
            if(i != 0) { // Prevents from Pushing an empty first Object
                donatorData.TotalSum = totalSum;
                thinnedData.push(donatorData);
            }
            totalSum = 0;

            //Create new Donator Scheme
            // console.log("Add new Donator")
            donatorData = getNextDonator(element);
        }
        //add Donation
        // console.log("Added Donation")
        donatorData.Donations.push(getNextDonation(element))
    }
    return thinnedData;
}


function getNextDonator(element) {
    totalSum = 0;
    let address = getAddressForContact(element.supplier.id) || undefined;
    if (address !== undefined) {
        return {
                "CustomerNumber": handleElement(element.supplier.customerNumber),
                "AcademicTitle": element.supplier.academicTitle == null ? "" : element.supplier.academicTitle,
                "Surename": element.supplier.surename == null ? element.supplier.name: element.supplier.surename,
                "Familyname": element.supplier.familyname == null ? "": element.supplier.familyname,
                "Street": address.Street,
                "ZipCity": `${address.Zip} ${address.City}`,
                "TotalSum": 0,
                "Donations": []
            }
    }
    console.log(`Information Error: No matching Address was returned at ID ${element.supplier.id}! At output.js:169`);

}
function getNextDonation(element) {
    totalSum += parseInt(element.sumNet);
    return {
        "Date": element.voucherDate,
        "Type": element.description,
        "Sum": element.sumNet,
        "SumInWords": convertNumToWord(element.sumNet)
    }
}

function getDonatorErrorData (element) {
    let name = element.supplierName.split(" ");
    let surename = '', familyname = '';
    for (let j = 0; j < (name.length - 1); j++) {
        surename += ` ${familyname[j]}`;
    } 
    return {
        "CustomerNumber": "Error, keine Kdnr registriert",
        "AcademicTitle": "",
        "Surename": surename,
        "Familyname": familyname[-1],
        "Street": "",
        "ZipCity": "",
        "TotalSum": element.sumNet,
        "Donations": []
    }
}

function convertNumToWord(numInteger) {
    if(numInteger <1) {
        return '';
    }
    if (numInteger.match(/[\.,]/i)){
        let split = numInteger.split('.');
        return num2words.numToWord(split[1]) + ',' + num2words.numToWord(split[1]);
    }
    //Uppercase: Default True
    return num2words.numToWord(numInteger)
}
function handleElement(element) {
    element = element.trim();
    
    

    return element;
}


function getAddressForContact(id) {
    for (let i = 0; i < addresses.length; i++){
        if(addresses[i].contact.id == id) {
            const address = addresses[i];
            return {
                "Street": address.street,
                "Zip": address.zip,
                "City": address.city,
                "Country": address.country.name
            }
        }
    }
    console.log(`Information Error: No matching Address found at ID ${id}! At output.js:200`);
}







/*
function formatData (){
    let formattedData = [];
    let lastCustomerNumber = 0;
    let donator = -1; // important to have at -1 to avoid the first element in the array to be empty. 
    
    for (let i = 0; i < sortedData.length; i++) {
        const element = sortedData[i];
        let customerNumber = sortedData[i].supplier.customerNumber || undefined;
        if(customerNumber != lastCustomerNumber && customerNumber != undefined){
            lastCustomerNumber = customerNumber;
            donator++;
            let adress;
            request.getAdressByContactID(element.supplier.id, () => {
                
                adress = request.getAdressData().objects;
                let nextDonator = [
                    element.supplier.customerNumber,
                    element.supplier.academicTitle,
                    element.supplier.surename,
                    element.supplier.familyname,
                    adress.street,
                    `${adress.zip} ${adress.city}`,
                    formattedData[donator][6] += element.sumNet,
                    []
                ]

                
                formattedData.push(nextDonator)
            });
            
        } else if (customerNumber == undefined) {
            donator++;
            let name = element.supplierName.split(" ");
            let surname, familyname = "";
            for (let j = 0; j < (name.length - 1); j++) {
                surname += (name[i]);
            } 
            formattedData.push([
                "Error, keine Kdnr registriert", "", surename, name[-1],"","", element.sumNet,[]
            ]);
        }
        let donation = [
            element.voucherDate,
            element.description,
            element.sumNet,
            convertNumToWord(element.sumNet)
        ]
        formattedData[formatData.length -1][7].push(donation)              
    }

    return formattedData;
}


*/



/**
 * Format the data sorted by this module to push to Frontend
 * Format = [[customernumber, title, firstName, lastName, streetNumber, postalCodeCity, donationSumAll, [['donationDate', 'type', 'description', 'donationSum', donationSumAsText], ...nextDonation], state],...nextUser]
 * @returns formattedData Array<String>
 */
/*
function formatData (){
    let formattedData = [];
    let lastCustomerNumber = 0;
    let donator = -1; // important to have at -1 to avoid the first element in the array to be empty. 
    
    for (let i = 0; i < sortedData.length; i++) {
        const element = sortedData[i];
        let customerNumber = sortedData[i].supplier.customerNumber || undefined;
        if(customerNumber != lastCustomerNumber && customerNumber != undefined){
            lastCustomerNumber = customerNumber;
            donator++;
            let adress;
            request.getAdressByContactID(element.supplier.id, () => {
                
                // adress = request.getAdressData().objects;
                // 
                // 
                // ]

                
                formattedData.push(nextDonator)
            });
            
        } else if (customerNumber == undefined) {
            donator++;
            
            formattedData.push([
                ]);
        }
        let donation = [
            element.voucherDate,
            element.description,
            element.sumNet,
            convertNumToWord(element.sumNet)
        ]
        formattedData[formatData.length -1][7].push(donation)              
    }

    return formattedData;
}
*/