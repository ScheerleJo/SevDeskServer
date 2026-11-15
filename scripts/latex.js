const mustache = require('mustache');
const { formatEuro, formatDate, escapeLatex } = require('./format');

// << >> instead of {{ }} because braces are part of LaTeX; values are inserted unescaped.
mustache.tags = ['<<', '>>'];
mustache.escape = (text) => text;

const LETTER_START = '<<LETTERSTART>>';
const LETTER_END = '<<LETTEREND>>';

/** Whether a template has the markers needed to split it into header/letter/footer. */
function isValidTemplate(template) {
    const start = template.indexOf(LETTER_START);
    const end = template.indexOf(LETTER_END);
    return start !== -1 && end > start;
}

/**
 * Create the LaTeX document for the given donators.
 * @param {Array<Object>} donators
 * @param {Number} year
 * @param {{company: Object, donationScheme: String}} latexConfig
 * @param {String} template content of the LaTeX template
 * @returns {String}
 */
function createTexDocument(donators, year, latexConfig, template) {
    const [header, rest] = template.split(LETTER_START);
    const [letter, footer] = rest.split(LETTER_END);
    const { company } = latexConfig;

    let output = mustache.render(header, {
        fromstreet: company.address.street,
        fromzipcode: company.address.zip,
        fromcity: company.address.city,
        fromiban: company.bank.iban,
        frombankname: company.bank.name,
        frombic: company.bank.bic,
        fromname: company.name,
        fromemail: company.email,
        fromphone: company.phone,
        fromurl: company.url,
        date: new Date().toLocaleDateString('de-DE'),
    });
    for (const donator of donators) output += createLetter(donator, year, letter, latexConfig.donationScheme);
    output += footer;
    return output;
}

function createLetter(donator, year, letter, donationScheme) {
    const surename = [donator.academicTitle, donator.surename].filter(Boolean).join(' ');
    return mustache.render(letter, {
        surename: escapeLatex(surename),
        familyname: escapeLatex(donator.familyname),
        street: escapeLatex(donator.address.street),
        zip: escapeLatex(donator.address.zip),
        city: escapeLatex(donator.address.city),
        country: escapeLatex(donator.address.country),
        totalsum: escapeLatex(formatEuro(donator.totalSum)),
        suminwords: escapeLatex(donator.sumInWords),
        timeframe: `01.01.${year} ‒ 31.12.${year}`,
        donations: donator.donations.map((donation) => mustache.render(donationScheme, {
            donationdate: formatDate(donation.date),
            donationtype: escapeLatex(donation.type),
            donationtax: donation.waived ? 'ja' : 'nein',
            donationsum: escapeLatex(formatEuro(donation.sum)),
        })).join(''),
    });
}

module.exports = { createTexDocument, isValidTemplate };
