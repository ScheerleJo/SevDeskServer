DocumentType = module;
const fileHandler = require('./fileIO');
const mustache = require('mustache');
const config = new (require('./configuration'))();
// const latex = require('node-latex'); Disabled for now, theoretically it should work

module.exports = { createTexDocument };

//Change the delimiter for Mustache to << >> instead of {{ }} because of latex reserved characters
mustache.tags = [ '<<', '>>' ];
mustache.escape = text => text;


/**
 * create the latex document from the data and template
 * @param {Map<Number,JSON>} data the data of the selected donators
 * @param {any} year the year of the donations
 * @returns {String} the latex document as a string
 */
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


/**
 * Fill the template with the data of the donator
 * @param {JSON} element the single donator to create the letter for
 * @param {Number} year Year of the donations
 * @param {String} letter Template for the letter
 * @returns {String} the latex-letter as a string
 */
function createLetter(element, year, letter) {
    let surename = element.academicTitle ? element.academicTitle + ' ' + element.surename : element.surename;
    return mustache.render(letter, {
        surename: surename,
        familyname: element.familyname,
        street: element.address.street,
        zip: element.address.zip,
        city: element.address.city,
        country: element.address.country,
        totalsum: element.totalSum,
        suminwords: element.sumInWords,
        timeframe: `01.01.${year} \u2012 31.12.${year}`,
        donations: createTexDonations(element.donations)
    });
}

/**
 * Create the donation entries for the letter
 * @param {Array<JSON>} donations the donations of the donator
 * @returns {String} the donation entries as a string
 */
function createTexDonations(donations){
    let donationString = '';
    const donationTemplate = config.get('donationScheme');
    for(let i = 0; i < donations.length; i++){
        donationString += mustache.render(donationTemplate, {
            donationdate: donations[i].date,
            donationtype: donations[i].type,
            donationtax: donations[i].waive,
            donationsum: donations[i].sum
        });
    }
    return donationString;
}

/**
 * Check if the element is not null or undefined
 * @param {any} element the element to check
 * @returns {any} the element or an empty string
 */
function checkValue(element) {
    if(element) return element;
    return '';
}

/**
 * Check if the element is not null or undefined
 * @param {JSON} element the element to check
 * @returns {JSON} the element with checked values
 */
function checkDonatorElement(element) {
    element.academicTitle = checkValue(element.academicTitle);
    element.surename = checkValue(element.surename);
    element.familyname = checkValue(element.familyname);
    element.address.ctreet = checkValue(element.address.street);
    element.address.zip = checkValue(element.address.zip);
    element.address.city = checkValue(element.address.city);
    element.address.country = checkValue(element.address.country);
    return element;
}