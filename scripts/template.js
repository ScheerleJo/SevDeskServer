DocumentType = module;

function donation() {
    return {
        "Date": new Date(),
        "Type": "Geldzuwendung",
        "Waive": "nein",
        "Sum": ""
    }
}
function newDonator() {
    return {
        "ID": 0,
        "Status": 0,
        "AcademicTitle": "",
        "Surename": "",
        "Familyname": "",
        "Address": {},
        "TotalSum": 0,
        "SumInWords": "",
        "Donations": []
    }
}
function address() {
    return {
        "Street": "",
        "Zip": "",
        "City": "",
        "Country": ""
    }
}

module.exports = {
    donation,
    newDonator,
    address
}
