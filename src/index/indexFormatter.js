// indexFormatter.js — format index summaries for display

const { summarizeIndex } = require('./logIndexer');

/**
 * Format index summary as a plain text table.
 * @param {Map} index
 * @param {string} label
 * @returns {string}
 */
function formatIndexTable(index, label = 'key') {
  const rows = summarizeIndex(index);
  if (!rows.length) return 'No entries in index.';
  const colW = Math.max(label.length, ...rows.map(r => String(r.key).length));
  const header = `${label.padEnd(colW)}  count`;
  const sep = '-'.repeat(header.length);
  const lines = rows.map(r => `${String(r.key).padEnd(colW)}  ${r.count}`);
  return [header, sep, ...lines].join('\n');
}

/**
 * Format index summary as JSON.
 * @param {Map} index
 * @returns {string}
 */
function formatIndexJson(index) {
  return JSON.stringify(summarizeIndex(index), null, 2);
}

/**
 * One-line summary of an index.
 * @param {Map} index
 * @param {string} field
 * @returns {string}
 */
function formatIndexSummary(index, field) {
  const rows = summarizeIndex(index);
  const total = rows.reduce((s, r) => s + r.count, 0);
  return `Index on '${field}': ${rows.length} unique values, ${total} total entries`;
}

module.exports = { formatIndexTable, formatIndexJson, formatIndexSummary };
