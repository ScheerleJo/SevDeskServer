DocumentType = module;
var data = '';
let originalData = '';
let countError = new Array();

module.exports = {
    setData,
    listDonationsPerUserID
}

function setData(APIData) {
    originalData, data = APIData;
    // data = APIData;
}

function listDonationsPerUserID() {
    // sort by objects.supplier.customernumber & date from oldest to newest

    countError = [];
    data = data.objects
    let sorted = []
    var len = data.length
    let smallestCustomerNumber = getSmallestCustomerNumber()
    let index = smallestCustomerNumber['index'];

    for (let i = index; len != 0 ;) {
        let currentObject = data[i];
        sorted.push(currentObject);
        len = deleteCurrentItem(i);
        smallestCustomerNumber = getSmallestCustomerNumber();
        i = smallestCustomerNumber["index"];
    }
    return sorted;
}

function deleteCurrentItem(index) {
    data.splice(index, 1)
    return data.length
}

//walk thru all donation objects to get smallest customerNumber
function getSmallestCustomerNumber() {
    let smallestNum = null
    let len = data.length
    let currentNum = null;
    let index = null;
    for (let i = 0; i < len; i ++) {
        try {
            currentNum = data[i].supplier.customerNumber;
        } catch (error) {
            if (countError.includes(data[i].id) == false) {
                countError.push(data[i].id);
                console.log("Error at item of 'data': " + i + '\n' + error)
            }

            if(countError.length >= len) {
                return {smallestNum: undefined, index: len - 1};
            }
            
            continue;
        }
        if (smallestNum == null || smallestNum > currentNum) {
            smallestNum = currentNum;
            index = i
        } 
    }
    return {smallestNum, index}
}

//!Deprecated and no longer in use
function getOldestDonationByCN(cn){

    let index = 0;
    let i = data.length - 1;
    do{
        let currentCN = 0
        try {
            currentCN = data[i].supplier.customerNumber;
        } catch (error) {
            console.log("Error at item of 'data': " + i + '\n' + error)
            i--
            continue;
        }
        if (currentCN == cn) {
            index = i;
            break;
        }
        i--
        } while (i > 0);
    return index;
}