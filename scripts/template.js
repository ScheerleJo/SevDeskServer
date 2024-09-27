class Template {
    constructor(){};

    donation() {
        return {
            "Date": new Date(),
            "Type": "Geldzuwendung",
            "Waive": "nein",
            "Sum": ""
        }
    }
    donator() {
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
    address() {
        return {
            "Street": "",
            "Zip": "",
            "City": "",
            "Country": ""
        }
    }
}
module.exports = Template;