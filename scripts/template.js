class Template {
    constructor(){};

    donation() {
        return {
            "id": 0,
            "Date": new Date(),
            "Type": "Geldzuwendung",
            "Waive": "nein",
            "Sum": ""
        }
    }
    donator() {
        return {
            "id": 0,
            "Status": 'unchecked',
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