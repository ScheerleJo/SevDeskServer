const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SERVER_CONFIG = path.join(ROOT, 'config', 'server_config.json');
const LATEX_CONFIG = path.join(ROOT, 'config', 'latex_config.json');

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * Write JSON via a temporary file so a crash never leaves a half-written file behind.
 */
function writeJson(file, data) {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
    fs.renameSync(tmp, file);
}

const serverConfig = readJson(SERVER_CONFIG);
const app = serverConfig.application || {};
const resolveOptional = (value) => (value ? path.resolve(ROOT, value) : null);

module.exports = {
    ROOT,
    readJson,
    writeJson,

    version: app['server-version'],
    port: Number(process.env.PORT) || app['server-port'],
    /** Folder with the built web frontend; served by this server if it exists. */
    clientPath: resolveOptional(process.env.CLIENT_PATH || app['client-path']),
    /** Only needed if the frontend runs on another origin without a proxy. */
    corsOrigin: process.env.CORS_ORIGIN || app['cors-origin'] || null,
    /** Folder for the saved state and generated certificates. */
    dataDir: path.resolve(ROOT, process.env.DATA_DIR || app['data-path'] || 'data'),
    /** SevDesk accounting type ("Buchungskonto") that marks a voucher as donation. */
    accountingTypeId: (serverConfig.sevdesk || {})['accounting-type-id'],

    /** Company data and donation scheme (without the internal templatePath). */
    getLatexConfig() {
        const { company, donationScheme } = readJson(LATEX_CONFIG);
        return { company, donationScheme };
    },

    saveLatexConfig({ company, donationScheme }) {
        const current = readJson(LATEX_CONFIG);
        writeJson(LATEX_CONFIG, { company, donationScheme, templatePath: current.templatePath });
        return { company, donationScheme };
    },

    getTemplatePath() {
        return path.resolve(ROOT, readJson(LATEX_CONFIG).templatePath);
    },
};
