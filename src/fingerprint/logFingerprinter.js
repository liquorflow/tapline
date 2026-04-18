// logFingerprinter.js — generate fingerprints for log entries to detect patterns

const crypto = require('crypto');

function normalizePath(path) {
  return path.replace(/\/[0-9a-f]{8,}/gi, '/:id').replace(/\/\d+/g, '/:n');
}

function fingerprintEntry(entry) {
  const normalized = normalizePath(entry.path || '');
  const raw = `${entry.method}|${normalized}|${entry.status}`;
  const hash = crypto.createHash('md5').update(raw).digest('hex').slice(0, 8);
  return { ...entry, fingerprint: hash, normalizedPath: normalized };
}

function fingerprintEntries(entries) {
  return entries.map(fingerprintEntry);
}

function groupByFingerprint(entries) {
  const fingerprinted = fingerprintEntries(entries);
  return fingerprinted.reduce((acc, entry) => {
    const key = entry.fingerprint;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});
}

function summarizeFingerprints(entries) {
  const groups = groupByFingerprint(entries);
  return Object.entries(groups).map(([fingerprint, items]) => ({
    fingerprint,
    method: items[0].method,
    normalizedPath: items[0].normalizedPath,
    status: items[0].status,
    count: items.length,
    avgLatency: Math.round(items.reduce((s, e) => s + (e.duration || 0), 0) / items.length),
  }));
}

module.exports = { normalizePath, fingerprintEntry, fingerprintEntries, groupByFingerprint, summarizeFingerprints };
