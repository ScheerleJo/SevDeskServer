DocumentType = module;
const num2words = require('num-words-de');
const sort = require('./sorting');
const request = require('./requests');

module.exports = {
    formatData,
    setSortedData
}
let sortedData = [];

function setSortedData (data) {
    sort.setData(data);
    sortedData = sort.listDonationsPerUserID();
}

/**
 * Format the data sorted by this module to push to Frontend
 * Format = [[customernumber, title, firstName, lastName, streetNumber, postalCodeCity, donationSumAll, [['donationDate', 'type', 'description', 'donationSum', donationSumAsText], ...nextDonation], state],...nextUser]
 * @returns formattedData Array<String>
 */
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

function convertNumToWord(numInteger) {
    //Uppercase: Default True
    return num2words.numToWord(numInteger)
}