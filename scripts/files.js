const fs = require('fs');
const path = require('path');
const os = require('os');
const config = require('./configuration');
const { ApiError, notFound } = require('./errors');
const { isValidTemplate } = require('./latex');

const ENV_FILE = path.join(config.ROOT, '.env');
const CERTIFICATE_DIR = path.join(config.dataDir, 'certificates');
const FILE_NAME = /^[\w.-]+\.tex$/;

const pad = (n) => String(n).padStart(2, '0');
const timestamp = (d = new Date()) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;

function fileInfo(file) {
    const stats = fs.statSync(file);
    return { name: path.basename(file), size: stats.size, createdAt: stats.mtime.toISOString() };
}

// ---------- API token ----------

/** Store the SevDesk token in .env (keeping other entries) and use it right away. */
function saveToken(token) {
    const lines = fs.existsSync(ENV_FILE)
        ? fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/).filter((line) => line.trim() && !/^\s*API_TOKEN\s*=/.test(line))
        : [];
    lines.push(`API_TOKEN=${token}`);
    fs.writeFileSync(ENV_FILE, lines.join(os.EOL) + os.EOL);
    process.env.API_TOKEN = token;
}

// ---------- LaTeX template ----------

function getTemplatePath() {
    const file = config.getTemplatePath();
    if (!fs.existsSync(file)) throw notFound('Die LaTeX-Vorlage wurde nicht gefunden.');
    return file;
}

const readTemplate = () => fs.readFileSync(getTemplatePath(), 'utf8');

/** Replace the template, keeping a backup of the previous one. */
function saveTemplate(content) {
    if (typeof content !== 'string' || !isValidTemplate(content)) {
        throw new ApiError(400, 'INVALID_TEMPLATE', 'Die Vorlage muss die Marker <<LETTERSTART>> und <<LETTEREND>> (in dieser Reihenfolge) enthalten.');
    }
    const file = config.getTemplatePath();
    if (fs.existsSync(file)) {
        const backupDir = path.join(path.dirname(file), 'backup');
        fs.mkdirSync(backupDir, { recursive: true });
        const { name, ext } = path.parse(file);
        fs.copyFileSync(file, path.join(backupDir, `${name}_${timestamp()}${ext}`));
    }
    fs.writeFileSync(file, content);
    const info = fileInfo(file);
    return { name: info.name, size: info.size, updatedAt: info.createdAt };
}

// ---------- Generated certificates ----------

function listCertificates() {
    if (!fs.existsSync(CERTIFICATE_DIR)) return [];
    return fs.readdirSync(CERTIFICATE_DIR)
        .filter((name) => FILE_NAME.test(name))
        .map((name) => fileInfo(path.join(CERTIFICATE_DIR, name)))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function writeCertificate(year, content) {
    fs.mkdirSync(CERTIFICATE_DIR, { recursive: true });
    const base = `Spendenbescheinigungen_${year}_${timestamp()}`;
    let name = `${base}.tex`;
    for (let i = 2; fs.existsSync(path.join(CERTIFICATE_DIR, name)); i++) name = `${base}_${i}.tex`;
    const file = path.join(CERTIFICATE_DIR, name);
    fs.writeFileSync(file, content);
    return fileInfo(file);
}

/** Absolute path of a generated file; rejects anything that is not a plain .tex name. */
function getCertificatePath(name) {
    const file = path.join(CERTIFICATE_DIR, String(name));
    if (!FILE_NAME.test(name) || !fs.existsSync(file)) throw notFound(`Die Datei ${name} wurde nicht gefunden.`);
    return file;
}

function deleteCertificate(name) {
    fs.unlinkSync(getCertificatePath(name));
}

module.exports = {
    saveToken,
    getTemplatePath,
    readTemplate,
    saveTemplate,
    listCertificates,
    writeCertificate,
    getCertificatePath,
    deleteCertificate,
};
