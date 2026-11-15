const express = require('express');
const config = require('./configuration');
const state = require('./state');
const files = require('./files');
const sevdesk = require('./sevdesk');
const { buildDonators } = require('./donators');
const { createTexDocument } = require('./latex');
const { ApiError, validationError, notFound, asyncHandler } = require('./errors');

const router = express.Router();

const STATUSES = ['unchecked', 'error', 'checked', 'done'];

// ---------- helpers ----------

let syncRunning = false;

/** Run a SevDesk fetch; only one may run at a time. */
async function exclusiveSync(fn) {
    if (syncRunning) throw new ApiError(409, 'SYNC_RUNNING', 'Es läuft bereits ein Abruf von SevDesk.');
    syncRunning = true;
    try {
        return await fn();
    } finally {
        syncRunning = false;
    }
}

function requireYear() {
    const year = state.getYear();
    if (!year) throw new ApiError(400, 'NO_YEAR', 'Es wurde noch kein Jahr von SevDesk geladen.');
    return year;
}

function parseYear(value) {
    const year = Number(value);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) throw validationError('"year" muss eine Jahreszahl zwischen 2000 und 2100 sein.');
    return year;
}

function parseIds(value) {
    if (!Array.isArray(value) || value.length === 0 || !value.every((id) => typeof id === 'string')) {
        throw validationError('"ids" muss eine nicht-leere Liste von Spender-IDs (Strings) sein.');
    }
    return [...new Set(value)];
}

/** Validate a PATCH body: only status and createCertificate may change. */
function parseChanges(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw validationError('Der Body muss ein JSON-Objekt sein.');
    const unknown = Object.keys(body).filter((key) => !['status', 'createCertificate'].includes(key));
    if (unknown.length) throw validationError(`Diese Felder können nicht geändert werden: ${unknown.join(', ')}`);
    if (!('status' in body) && !('createCertificate' in body)) throw validationError('Es muss "status" oder "createCertificate" angegeben werden.');
    if ('status' in body && !STATUSES.includes(body.status)) throw validationError(`"status" muss einer dieser Werte sein: ${STATUSES.join(', ')}`);
    if ('createCertificate' in body && typeof body.createCertificate !== 'boolean') throw validationError('"createCertificate" muss true oder false sein.');
    return body;
}

const isString = (value) => typeof value === 'string';

function parseLatexConfig(body) {
    const c = body && body.company;
    const valid = c && isString(c.name) && isString(c.phone) && isString(c.email) && isString(c.url)
        && c.address && isString(c.address.street) && isString(c.address.zip) && isString(c.address.city)
        && c.bank && isString(c.bank.name) && isString(c.bank.iban) && isString(c.bank.bic)
        && isString(body.donationScheme);
    if (!valid) throw validationError('Die Konfiguration ist unvollständig. Siehe GET /api/config für den Aufbau.');
    const { name, phone, email, url, address, bank } = c;
    return {
        company: {
            name,
            address: { street: address.street, zip: address.zip, city: address.city },
            phone, email, url,
            bank: { name: bank.name, iban: bank.iban, bic: bank.bic },
        },
        donationScheme: body.donationScheme,
    };
}

/** Fetch one donator again from SevDesk and put it into the state. */
async function refetchDonator(id, year) {
    const addresses = await sevdesk.getAddresses();
    if (id.startsWith('voucher-')) {
        // Voucher without contact: look it up among all vouchers of the year.
        const voucherId = id.slice('voucher-'.length);
        const voucher = (await sevdesk.getDonations(year)).find((v) => String(v.id) === voucherId);
        state.remove(id);
        if (!voucher) return;
        const [donator] = Object.values(buildDonators([voucher], addresses));
        // Now linked to a contact that is already listed: reload that contact completely.
        if (donator.id !== id && state.hasDonator(donator.id)) return refetchDonator(donator.id, year);
        state.put(donator);
        return;
    }
    const donator = buildDonators(await sevdesk.getDonations(year, id), addresses)[id];
    // No donations left for this contact in SevDesk: drop it.
    if (donator) state.put(donator);
    else state.remove(id);
}

// ---------- system ----------

router.get('/health', (req, res) => {
    res.json({ status: 'ok', version: config.version, tokenConfigured: Boolean(process.env.API_TOKEN), syncRunning });
});

// ---------- donators ----------

router.get('/state', (req, res) => res.json(state.toResponse()));

router.post('/sync', asyncHandler(async (req, res) => {
    const year = parseYear(req.body && req.body.year);
    await exclusiveSync(async () => {
        const [vouchers, addresses] = await Promise.all([sevdesk.getDonations(year), sevdesk.getAddresses()]);
        state.replace(year, buildDonators(vouchers, addresses));
    });
    res.json(state.toResponse());
}));

router.post('/sync/new', asyncHandler(async (req, res) => {
    const year = requireYear();
    await exclusiveSync(async () => {
        const [vouchers, addresses] = await Promise.all([sevdesk.getDonations(year), sevdesk.getAddresses()]);
        const added = state.addMissing(buildDonators(vouchers, addresses));
        console.log(`Added ${added} new donators`);
    });
    res.json(state.toResponse());
}));

router.patch('/donators', (req, res) => {
    const ids = parseIds(req.body && req.body.ids);
    state.update(ids, parseChanges(req.body.changes));
    res.json(state.toResponse());
});

router.patch('/donators/:id', (req, res) => {
    state.update([req.params.id], parseChanges(req.body));
    res.json(state.toResponse());
});

router.post('/donators/:id/refetch', asyncHandler(async (req, res) => {
    const year = requireYear();
    state.getDonator(req.params.id);
    await exclusiveSync(() => refetchDonator(req.params.id, year));
    res.json(state.toResponse());
}));

router.delete('/donators/:id', (req, res) => {
    state.remove(req.params.id);
    res.json(state.toResponse());
});

// ---------- certificates ----------

router.post('/certificates', (req, res) => {
    const year = requireYear();
    let donators;
    if (req.body && req.body.ids !== undefined) {
        donators = parseIds(req.body.ids).map(state.getDonator);
        const invalid = donators.filter((d) => !d.createCertificate || !['checked', 'done'].includes(d.status));
        if (invalid.length) {
            throw validationError(`Diese Spender sind nicht geprüft oder ohne Bescheinigung markiert: ${invalid.map((d) => d.id).join(', ')}`);
        }
    } else {
        donators = state.allDonators().filter((d) => d.status === 'checked' && d.createCertificate);
    }
    if (!donators.length) {
        throw new ApiError(400, 'NO_CERTIFICATES', 'Es gibt keine geprüften Spender, für die eine Bescheinigung erstellt werden soll.');
    }

    donators.sort((a, b) => a.familyname.localeCompare(b.familyname, 'de') || a.surename.localeCompare(b.surename, 'de'));
    const tex = createTexDocument(donators, year, config.getLatexConfig(), files.readTemplate());
    const file = files.writeCertificate(year, tex);
    state.update(donators.map((d) => d.id), { status: 'done', certificate: { file: file.name, createdAt: file.createdAt } });
    console.log(`Created ${file.name} with ${donators.length} certificates`);
    res.status(201).json({ file: { ...file, count: donators.length }, state: state.toResponse() });
});

router.get('/certificates', (req, res) => res.json(files.listCertificates()));

router.get('/certificates/:name', (req, res) => res.download(files.getCertificatePath(req.params.name)));

router.delete('/certificates/:name', (req, res) => {
    files.deleteCertificate(req.params.name);
    res.status(204).end();
});

// ---------- settings ----------

router.put('/token', (req, res) => {
    const token = req.body && req.body.token;
    if (!isString(token) || !/^[\w-]{10,200}$/.test(token)) throw validationError('"token" muss ein gültiger SevDesk-API-Token sein.');
    files.saveToken(token);
    console.log('API token updated');
    res.status(204).end();
});

router.get('/config', (req, res) => res.json(config.getLatexConfig()));

router.put('/config', (req, res) => res.json(config.saveLatexConfig(parseLatexConfig(req.body))));

router.get('/template', (req, res) => res.download(files.getTemplatePath()));

router.put('/template', express.text({ type: ['text/plain', 'application/x-tex', 'text/x-tex'], limit: '5mb' }), (req, res) => {
    res.json(files.saveTemplate(req.body));
});

// ---------- fallbacks ----------

router.use((req, res, next) => next(notFound(`Unbekannter Endpunkt: ${req.method} ${req.originalUrl}`)));

module.exports = router;
