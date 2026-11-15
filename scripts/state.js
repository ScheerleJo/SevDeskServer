const fs = require('fs');
const path = require('path');
const config = require('./configuration');
const { toCents, fromCents } = require('./format');
const { notFound } = require('./errors');

const STATE_FILE = path.join(config.dataDir, 'state.json');

/** The single shared state: { year, syncedAt, donators: { [id]: Donator } } */
let state = { year: null, syncedAt: null, donators: {} };

function load() {
    if (!fs.existsSync(STATE_FILE)) {
        console.info(`No saved state found at ${STATE_FILE}`);
        return;
    }
    try {
        state = config.readJson(STATE_FILE);
        console.info(`Loaded state for ${state.year} with ${Object.keys(state.donators).length} donators`);
    } catch (error) {
        console.error(`Could not read ${STATE_FILE}: ${error.message}`);
    }
}

function save() {
    fs.mkdirSync(config.dataDir, { recursive: true });
    config.writeJson(STATE_FILE, state);
}

function summary() {
    const result = { totalDonators: 0, totalSum: 0, unchecked: 0, error: 0, checked: 0, checkedWithoutCertificate: 0, done: 0 };
    let cents = 0;
    for (const donator of Object.values(state.donators)) {
        result.totalDonators++;
        cents += toCents(donator.totalSum);
        if (donator.status === 'checked' && !donator.createCertificate) result.checkedWithoutCertificate++;
        else result[donator.status]++;
    }
    result.totalSum = fromCents(cents);
    return result;
}

/** State as described in API.md. */
function toResponse() {
    const donators = Object.values(state.donators).sort((a, b) =>
        a.familyname.localeCompare(b.familyname, 'de') || a.surename.localeCompare(b.surename, 'de'));
    return { year: state.year, syncedAt: state.syncedAt, summary: summary(), donators };
}

const getYear = () => state.year;

function getDonator(id) {
    const donator = state.donators[id];
    if (!donator) throw notFound(`Spender ${id} wurde nicht gefunden.`);
    return donator;
}

const hasDonator = (id) => Boolean(state.donators[id]);

const allDonators = () => Object.values(state.donators);

/** Replace everything with freshly fetched data. */
function replace(year, donators) {
    state = { year, syncedAt: new Date().toISOString(), donators };
    save();
}

/** Add donators that are not in the state yet. Returns the number added. */
function addMissing(donators) {
    let added = 0;
    for (const [id, donator] of Object.entries(donators)) {
        if (!state.donators[id]) {
            state.donators[id] = donator;
            added++;
        }
    }
    state.syncedAt = new Date().toISOString();
    save();
    return added;
}

function put(donator) {
    state.donators[donator.id] = donator;
    save();
}

function remove(id) {
    getDonator(id);
    delete state.donators[id];
    save();
}

/** Apply the same field changes to several donators (all-or-nothing). */
function update(ids, changes) {
    const donators = ids.map(getDonator);
    for (const donator of donators) Object.assign(donator, changes);
    save();
}

module.exports = { load, save, toResponse, getYear, getDonator, hasDonator, allDonators, replace, addMissing, put, remove, update };
