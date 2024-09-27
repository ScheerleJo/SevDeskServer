DocumentType = module;
const fileHandler = require('./fileHandling');
// const latex = require('node-latex'); Disabled for now, theoretically it should work
const mustache = require('mustache');
const Config = require('./configuration');

let config = new Config();


module.exports = { createTexDocument };

//Change the delimiter for Mustache to << >> instead of {{ }} because of latex reserved characters
mustache.tags = [ '<<', '>>' ];
mustache.escape = text => text;

function createTexDocument(data, year) {
    const template = fileHandler.getTexTemplate();
    const header = template.split('<<LETTERSTART>>')[0];

    const headerData = {
        fromstreet: config.get("company:address:street"),
        fromzipcode: config.get("company:address:zip"),
        fromcity: config.get("company:address:city"),
        fromiban: config.get("company:bank:iban"),
        frombankname: config.get("company:bank:name"),
        frombic: config.get("company:bank:bic"),
        fromname: config.get("company:name"),
        fromemail: config.get("company:email"),
        fromphone: config.get("company:phone"),
        fromurl: config.get("company:url"),
        date: new Date().toLocaleDateString(), 
    };
    
    let input = mustache.render(header, headerData);

    for(const key in data){
        const letter = template.split('<<LETTERSTART>>')[1].split('<<LETTEREND>>')[0];
        input += createLetter(checkDonatorElement(data[key]), year, letter);
    }

    input += template.split('<<LETTEREND>>')[1];
    return input;

    
    // latex(input).pipe(fs.createWriteStream('hello-tex.pdf'));
}





function createTimePeriod(year) {
    return `01.01.${year} \u2012 31.12.${year}`;
}


function createLetter(element, year, letter) {
    let surename = element.AcademicTitle ? element.AcademicTitle + ' ' + element.Surename : element.Surename;
    return mustache.render(letter, {
        surename: surename,
        familyname: element.Familyname,
        street: element.Address.Street,
        zip: element.Address.Zip,
        city: element.Address.City,
        country: element.Address.Country,
        totalsum: element.TotalSum,
        suminwords: element.SumInWords,
        timeframe: createTimePeriod(year),
        donations: createTexDonations(element.Donations)
    });
}

function createTexDonations(donations){
    let donationString = '';
    const donationTemplate = config.get('donationScheme');
    for(let i = 0; i < donations.length; i++){
        donationString += mustache.render(donationTemplate, {
            donationdate: donations[i].Date,
            donationtype: donations[i].Type,
            donationtax: donations[i].Waive,
            donationsum: donations[i].Sum
        });
    }
    return donationString;
}

function checkValue(element) {
    if(element) return element;
    return '';
}
function checkDonatorElement(element) {
    element.AcademicTitle = checkValue(element.AcademicTitle);
    element.Surename = checkValue(element.Surename);
    element.Familyname = checkValue(element.Familyname);
    element.Address.Street = checkValue(element.Address.Street);
    element.Address.ZipCity = checkValue(element.Address.ZipCity);
    element.Address.Country = checkValue(element.Address.Country);
    return element;
}