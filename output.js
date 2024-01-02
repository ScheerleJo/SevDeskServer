DocumentType = module;

let formattedData;
let year;


module.exports = {
    setData,

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
    donatorData.Country != "Deutschland" ? ', ' + donatorData.Country : ''
    return `${donatorData.Surename + ' ' + donatorData.FamilyName}, ${donatorData.Street}, ${donatorData.ZipCity}` + country;
}
function createPostalAddress(donatorData){
    donatorData.Country != "Deutschland" ? '\\\\ ' + donatorData.Country : ''
    return `${donatorData.Surename + ' ' + donatorData.FamilyName}\\\\ ${donatorData.Street}\\\\ ${donatorData.ZipCity}` + country;
}
function createDonationOneLiner(donatorData) {
    return `€ ${donatorData.TotalSum} / ${donatorData.SumInWords}€ / ${createTimePeriod()}`;
}
