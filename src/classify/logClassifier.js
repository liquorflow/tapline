// logClassifier.js — classify log entries into named categories based on rules

/**
 * Classify a single entry by latency tier.
 * @param {object} entry
 * @returns {string}
 */
function classifyLatency(entry) {
  const ms = entry.duration ?? entry.latency ?? 0;
  if (ms < 100) return 'fast';
  if (ms < 500) return 'normal';
  if (ms < 2000) return 'slow';
  return 'critical';
}

/**
 * Classify a single entry by HTTP status class.
 * @param {object} entry
 * @returns {string}
 */
function classifyStatus(entry) {
  const s = entry.status ?? 0;
  if (s >= 500) return 'server-error';
  if (s >= 400) return 'client-error';
  if (s >= 300) return 'redirect';
  if (s >= 200) return 'success';
  return 'unknown';
}

/**
 * Classify a single entry by HTTP method safety.
 * @param {object} entry
 * @returns {string}
 */
function classifyMethod(entry) {
  const safe = ['GET', 'HEAD', 'OPTIONS'];
  const idempotent = ['PUT', 'DELETE', 'PATCH'];
  const m = (entry.method ?? '').toUpperCase();
  if (safe.includes(m)) return 'safe';
  if (idempotent.includes(m)) return 'idempotent';
  if (m === 'POST') return 'unsafe';
  return 'unknown';
}

/**
 * Apply a list of classifier functions to an entry, returning a map of label -> class.
 * @param {object} entry
 * @param {Array<{label: string, fn: function}>} classifiers
 * @returns {object}
 */
function classifyEntry(entry, classifiers) {
  const result = {};
  for (const { label, fn } of classifiers) {
    result[label] = fn(entry);
  }
  return result;
}

/**
 * Classify all entries using the given classifiers.
 * Returns entries with a `_classes` field attached.
 * @param {object[]} entries
 * @param {Array<{label: string, fn: function}>} classifiers
 * @returns {object[]}
 */
function classifyEntries(entries, classifiers) {
  return entries.map(entry => ({
    ...entry,
    _classes: classifyEntry(entry, classifiers),
  }));
}

/**
 * Default classifier set.
 */
const DEFAULT_CLASSIFIERS = [
  { label: 'latency', fn: classifyLatency },
  { label: 'status', fn: classifyStatus },
  { label: 'method', fn: classifyMethod },
];

module.exports = {
  classifyLatency,
  classifyStatus,
  classifyMethod,
  classifyEntry,
  classifyEntries,
  DEFAULT_CLASSIFIERS,
};
