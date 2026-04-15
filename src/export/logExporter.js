const fs = require('fs');
const path = require('path');

/**
 * Export log entries to a CSV file
 * @param {Array} entries - parsed log entries
 * @param {string} filePath - output file path
 */
function exportToCsv(entries, filePath) {
  if (!entries || entries.length === 0) {
    throw new Error('No entries to export');
  }

  const headers = ['method', 'path', 'status', 'duration', 'timestamp'];
  const rows = entries.map(entry => [
    entry.method || '',
    entry.path || '',
    entry.status || '',
    entry.duration || '',
    entry.timestamp || ''
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  fs.writeFileSync(filePath, csv, 'utf8');
  return filePath;
}

/**
 * Export log entries to an NDJSON file (newline-delimited JSON)
 * @param {Array} entries - parsed log entries
 * @param {string} filePath - output file path
 */
function exportToNdjson(entries, filePath) {
  if (!entries || entries.length === 0) {
    throw new Error('No entries to export');
  }

  const ndjson = entries.map(entry => JSON.stringify(entry)).join('\n');
  fs.writeFileSync(filePath, ndjson, 'utf8');
  return filePath;
}

/**
 * Export log entries to a plain text file
 * @param {Array} entries - parsed log entries
 * @param {string} filePath - output file path
 */
function exportToText(entries, filePath) {
  if (!entries || entries.length === 0) {
    throw new Error('No entries to export');
  }

  const lines = entries.map(entry =>
    `[${entry.timestamp || '-'}] ${entry.method || '-'} ${entry.path || '-'} ${entry.status || '-'} ${entry.duration || '-'}ms`
  );

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  return filePath;
}

/**
 * Export entries using the specified format
 * @param {Array} entries
 * @param {string} filePath
 * @param {'csv'|'ndjson'|'text'} format
 */
function exportEntries(entries, filePath, format = 'csv') {
  switch (format) {
    case 'csv':    return exportToCsv(entries, filePath);
    case 'ndjson': return exportToNdjson(entries, filePath);
    case 'text':   return exportToText(entries, filePath);
    default: throw new Error(`Unsupported export format: ${format}`);
  }
}

module.exports = { exportToCsv, exportToNdjson, exportToText, exportEntries };
