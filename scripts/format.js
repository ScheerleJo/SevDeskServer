const num2words = require('num-words-de');

/** Convert an amount (number or numeric string like "200.00") to integer cents. */
const toCents = (value) => Math.round(parseFloat(value) * 100) || 0;

const fromCents = (cents) => cents / 100;

const words = (n) => num2words.numToWord(n, { indefinite_ein: true });

/**
 * Amount in words for the certificate, e.g. "Zweihundert" or "Zwölf Euro Fünfzig".
 * @param {Number} cents
 */
function sumInWords(cents) {
    const euros = Math.floor(cents / 100);
    const rest = cents % 100;
    if (cents === 0) return 'Null';
    if (euros === 0) return `${words(rest)} Cent`;
    if (rest === 0) return words(euros);
    return `${words(euros)} Euro ${words(rest)}`;
}

/** 1650.5 -> "1.650,50 €" */
const formatEuro = (value) =>
    value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Normalize a SevDesk date ("2025-10-11T00:00:00+02:00") to "YYYY-MM-DD"
 * without shifting it through UTC.
 */
function isoDate(value) {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value || ''));
    if (match) return match[1];
    const date = new Date(value);
    if (isNaN(date)) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "2025-10-11" -> "11.10.2025" */
function formatDate(iso) {
    const [y, m, d] = String(iso).split('-');
    return d && m && y ? `${d}.${m}.${y}` : String(iso);
}

const LATEX_ESCAPES = {
    '\\': '\\textbackslash{}',
    '&': '\\&',
    '%': '\\%',
    '$': '\\$',
    '#': '\\#',
    '_': '\\_',
    '{': '\\{',
    '}': '\\}',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}',
};

/** Escape characters with special meaning in LaTeX (for donor data only). */
const escapeLatex = (value) => String(value ?? '').replace(/[\\&%$#_{}~^]/g, (c) => LATEX_ESCAPES[c]);

module.exports = { toCents, fromCents, sumInWords, formatEuro, isoDate, formatDate, escapeLatex };
