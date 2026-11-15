const { toCents, fromCents, sumInWords, isoDate } = require('./format');

/**
 * Index SevDesk contact addresses by contact id (first address wins).
 * @param {Array} addresses SevDesk ContactAddress objects
 * @returns {Map<String, Object>}
 */
function indexAddresses(addresses) {
    const index = new Map();
    for (const address of addresses) {
        const contactId = address.contact && String(address.contact.id);
        if (contactId && !index.has(contactId)) index.set(contactId, address);
    }
    return index;
}

/** Key of the donator a voucher belongs to. */
function donatorKey(voucher) {
    return voucher.supplier && voucher.supplier.id ? String(voucher.supplier.id) : `voucher-${voucher.id}`;
}

function readName(voucher, problems) {
    const supplier = voucher.supplier;
    if (supplier && supplier.id) {
        const surename = supplier.surename || '';
        const familyname = supplier.familyname || '';
        if (surename && familyname) return { surename, familyname };
        // Organisations only have a name.
        if (supplier.name) return { surename: '', familyname: supplier.name };
        problems.push('Vor- oder Nachname fehlt');
        return { surename, familyname };
    }
    problems.push('Kein Kontakt in SevDesk verknüpft');
    if (voucher.supplierName) return { surename: '', familyname: voucher.supplierName };
    problems.push('Name fehlt');
    return { surename: '', familyname: '' };
}

function readAddress(contactId, addressIndex, problems) {
    const found = contactId && addressIndex.get(contactId);
    const address = {
        street: (found && found.street) || '',
        zip: (found && found.zip) || '',
        city: (found && found.city) || '',
        country: (found && found.country && found.country.name) || '',
    };
    if (!found) problems.push('Adresse fehlt');
    else if (!address.street || !address.zip || !address.city || !address.country) problems.push('Adresse unvollständig');
    return address;
}

function createDonator(voucher, addressIndex) {
    const problems = [];
    const id = donatorKey(voucher);
    const { surename, familyname } = readName(voucher, problems);
    const contactId = voucher.supplier && voucher.supplier.id ? String(voucher.supplier.id) : null;
    const address = readAddress(contactId, addressIndex, problems);
    return {
        id,
        status: problems.length ? 'error' : 'unchecked',
        createCertificate: true,
        academicTitle: (voucher.supplier && voucher.supplier.academicTitle) || '',
        surename,
        familyname,
        address,
        totalSum: 0,
        sumInWords: '',
        problems,
        certificate: null,
        donations: [],
    };
}

function createDonation(voucher) {
    return {
        id: String(voucher.id),
        date: isoDate(voucher.voucherDate),
        type: 'Geldzuwendung',
        waived: false,
        sum: fromCents(toCents(voucher.sumNet)),
    };
}

/**
 * Group SevDesk vouchers into donators.
 * @param {Array} vouchers SevDesk Voucher objects (with embedded supplier)
 * @param {Array} addresses SevDesk ContactAddress objects
 * @returns {Object<String, Object>} donators by id
 */
function buildDonators(vouchers, addresses) {
    const addressIndex = indexAddresses(addresses);
    const donators = {};
    for (const voucher of vouchers) {
        const id = donatorKey(voucher);
        if (!donators[id]) donators[id] = createDonator(voucher, addressIndex);
        donators[id].donations.push(createDonation(voucher));
    }

    let totalCents = 0;
    for (const donator of Object.values(donators)) {
        donator.donations.sort((a, b) => a.date.localeCompare(b.date));
        const cents = donator.donations.reduce((sum, d) => sum + toCents(d.sum), 0);
        donator.totalSum = fromCents(cents);
        donator.sumInWords = sumInWords(cents);
        totalCents += cents;
    }

    const voucherCents = vouchers.reduce((sum, v) => sum + toCents(v.sumNet), 0);
    if (voucherCents !== totalCents) {
        console.error(`Sum mismatch: vouchers ${fromCents(voucherCents)} vs. donators ${fromCents(totalCents)}`);
    }
    const withErrors = Object.values(donators).filter((d) => d.status === 'error').length;
    console.log(`Built ${Object.keys(donators).length} donators from ${vouchers.length} vouchers (${withErrors} with errors)`);
    return donators;
}

module.exports = { buildDonators };
