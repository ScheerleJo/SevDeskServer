DocumentType = module;

const donation = {
    "Date": new Date(),
    "Type": "Geldzuwendung",
    "Waive": "nein",
    "Sum": ""
}
const newDonator = {
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
const address = {
    "Street": "",
    "Zip": "",
    "City": "",
    "Country": ""
}

module.exports = {
    donator,
    donation,
    newDonator,
    address
}
