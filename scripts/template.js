class Template {
    constructor(){};

    donation() {
        return {
            "id": 0,
            "date": new Date(),
            "type": "Geldzuwendung",
            "waive": "nein",
            "sum": ""
        }
    }
    donator() {
        return {
            "id": 0,
            "status": 'unchecked',
            "academicTitle": "",
            "surename": "",
            "familyname": "",
            "address": {},
            "totalSum": 0,
            "formattedSum": "",
            "sumInWords": "",
            "donations": []
        }
    }
    address() {
        return {
            "street": "",
            "zip": "",
            "city": "",
            "country": ""
        }
    }
}
module.exports = Template;