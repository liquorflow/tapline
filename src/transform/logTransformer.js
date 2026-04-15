/**
 * logTransformer.js
 * Utilities for transforming and normalizing log entries.
 */

/**
 * Normalize a log entry by trimming string fields and lowercasing the method.
 * @param {object} entry
 * @returns {object}
 */
function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object') throw new Error('Invalid entry');
  return {
    ...entry,
    method: typeof entry.method === 'string' ? entry.method.toUpperCase().trim() : entry.method,
    path: typeof entry.path === 'string' ? entry.path.trim() : entry.path,
    status: typeof entry.status === 'number' ? entry.status : parseInt(entry.status, 10),
  };
}

/**
 * Redact sensitive headers from a log entry.
 * @param {object} entry
 * @param {string[]} [fields=['authorization', 'cookie', 'x-api-key']]
 * @returns {object}
 */
function redactHeaders(entry, fields = ['authorization', 'cookie', 'x-api-key']) {
  if (!entry || typeof entry !== 'object') throw new Error('Invalid entry');
  if (!entry.headers || typeof entry.headers !== 'object') return entry;
  const redacted = {};
  for (const [key, value] of Object.entries(entry.headers)) {
    redacted[key] = fields.includes(key.toLowerCase()) ? '[REDACTED]' : value;
  }
  return { ...entry, headers: redacted };
}

/**
 * Add a derived `latencyBucket` field based on response time.
 * @param {object} entry
 * @returns {object}
 */
function bucketLatency(entry) {
  if (!entry || typeof entry !== 'object') throw new Error('Invalid entry');
  const ms = entry.responseTime;
  let bucket;
  if (typeof ms !== 'number' || isNaN(ms)) {
    bucket = 'unknown';
  } else if (ms < 100) {
    bucket = 'fast';
  } else if (ms < 500) {
    bucket = 'medium';
  } else {
    bucket = 'slow';
  }
  return { ...entry, latencyBucket: bucket };
}

/**
 * Apply a pipeline of transform functions to an array of entries.
 * @param {object[]} entries
 * @param {Function[]} transforms
 * @returns {object[]}
 */
function transformEntries(entries, transforms = []) {
  if (!Array.isArray(entries)) throw new Error('entries must be an array');
  return entries.map(entry =>
    transforms.reduce((e, fn) => fn(e), entry)
  );
}

module.exports = { normalizeEntry, redactHeaders, bucketLatency, transformEntries };
