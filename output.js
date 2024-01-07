DocumentType = module;
const fileHandler = require('./fileHandling');

let formattedData;
let year;


module.exports = {
    setData,
    setYear,
    createTexDoc
}
function setData(data) {
    formattedData = data;
}
function setYear(pYear) {
    year = pYear;
}

function createTimePeriod() {
    return `01.01.${year} \u2012 31.12.${year}`;
}
function createDonatorOneLiner(donatorData) {
    let country = donatorData.Country != "Deutschland" ? ', ' + donatorData.Country : ''
    let academicTitle = donatorData.AcademicTitle != '' ? donatorData.AcademicTitle + ' ': '';
    return `${academicTitle + donatorData.Surename + ' ' + donatorData.Familyname}, ${donatorData.Street}, ${donatorData.ZipCity}` + country;
}
function createPostalAddress(donatorData){
    let country = donatorData.Country != "Deutschland" ? '\\\\ ' + donatorData.Country : ''
    return `${donatorData.Surename + ' ' + donatorData.Familyname}\\\\ ${donatorData.Street}\\\\ ${donatorData.ZipCity}` + country;
}
function createDonationOneLiner(donatorData) {
    return `${donatorData.TotalSum} / ${donatorData.SumInWords} / ${createTimePeriod()}`;
}
function createTexDoc() {
    let header = fileHandler.getTexData('header.tex');
    let footer = fileHandler.getTexData('footer.tex');
    let block = '';
    for(let i = 0; i < formattedData.length; i++){
        const element = formattedData[i];
        block += createLetter(element);
    }
    let documentData = header + block + footer;
    return documentData;
}

function createLetter(donatorElement) {
    donatorElement = checkDonatorElement(donatorElement);

    let begin = '\n\n\\begin{letter}{' + createPostalAddress(donatorElement) + '}\n\n';
    let opening ='\\opening{im Sinne des § 10 b des Einkommensteuergesetzes an eine der in § 5 Abs. 1 Nr. 9 des Körperschaftsteuergesetzes bezeichneten Körperschaften, Personenvereinigungen oder Vermögensmassen}\n\n';
    let p1 = 'Name und Anschrift des Zuwendenden:\n\n';
    let textbf1 = '\\textbf{' + createDonatorOneLiner(donatorElement) +'}\n\n';
    let p2 = 'Betrag der Zuwendung in Ziffern/in Buchstaben/Zeitraum der Sammelbestätigung:\n\n';
    let textbf2 ='\\textbf{' + createDonationOneLiner(donatorElement) + '}\n\n';
    let p3 = 'Wir sind wegen Förderung religiöser Zwecke i.S.d. § 51 ff. AO nach dem letzten uns zugegangenen Freistellungsbescheides des Finanzamts Worms-Kirchheimbolanden, St.Nr.: 44/673/00521 vom 09.11.2021 nach § 5 Abs. 1 Nr. 9 des Körperschaftsteuergesetzes von der Körperschaftssteuer und nach § 3 Nr. 6 des Gewerbesteuergesetzes von der Gewerbesteuer befreit.\n\n' +
    'Es wird bestätigt, dass es sich nicht um einen Mitgliedsbeitrag handelt, dessen Abzug nach § 10b Abs. 1 des Einkommensteuergesetzes ausgeschlossen ist.\n\n' +    
    'Es wird bestätigt, dass über die in der Gesamtsumme enthaltenen Zuwendungen keine weiteren Bestätigungen, weder formelle Zuwendungsbestätigungen noch Beitragsquittungen oder Ähnliches ausgestellt wurden und werden.\n'; 
    let closing = '\\enlargethispage{5\\baselineskip}\n\\closing{}\n\n\\ps\\footnotesize\n';
    let textbf3 = '\\textbf{Hinweis:} Wer vorsätzlich oder grob fahrlässig eine unrichtige Zuwendungsbestätigung erstellt oder veranlasst, dass Zuwendungen nicht zu den in der Zuwendungsbestätigung angegebenen steuerbegünstigten Zwecken verwendet werden, haftet für die entgangene Steuer (§ 10b Abs. 4 EStG, § 9 Abs. 3 KStG, § 9 Nr. 5 GewStG). Diese Bestätigung wird nicht als Nachweis für die steuerliche Berücksichtigung der Zuwendung anerkannt, wenn das Datum des Freistellungsbescheides länger als 5 Jahre bzw. das Datum der Feststellung der Einhaltung der satzungsmäßigen Voraussetzungen nach § 60a Abs. 1 AO länger als 3 Jahre seit Ausstellung des Bescheides zurückliegt (§ 63 Abs. 5 AO).\n\n';
    let additional = '\\newpage\\normalsize\n';
    let textbf4 = '\\textbf{Anlage zur Sammelbestätigung}\n\n';
    let tableHead = '\\noindent\\begin{tabular}{lllr}\nDatum der Zuwendung & Art der Zuwendung & Verzicht auf Erstattung & Betrag \\\\ \\addlinespace\n';
    let tableData = '';
    let end = '\\end{tabular}\n\n\\end{letter}\n\n';

    for(let i = 0; i < donatorElement.Donations.length; i++) {
        const donation = donatorElement.Donations[i];
        tableData +=  `${donation.Date} & ${donation.Type} & ${donation.Waive} & ${donation.Sum} \\\\\n`;
    }
    let file = begin + opening + p1 + textbf1 + p2 + textbf2 + p3 + closing + textbf3 + additional + textbf4 + tableHead + tableData + end;

    return file;
}


function checkValue(element) {
    let checked ='';
    if(element != undefined) checked = element;
    return checked;
}
function checkDonatorElement(element) {
    element.Surename = checkValue(element.Surename);
    element.Familyname = checkValue(element.Familyname);
    element.AcademicTitle = checkValue(element.AcademicTitle);
    element.Street = checkValue(element.Street);
    element.ZipCity = checkValue(element.ZipCity);
    element.Country = checkValue(element.Country);
    return element;
}