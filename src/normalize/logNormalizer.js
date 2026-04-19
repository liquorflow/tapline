// Normalize log entries to a consistent shape

const DEFAULT_FIELDS = {
  method: 'UNKNOWN',
  path: '/',
  status: 0,
  duration: 0,
  timestamp: null,
  headers: {},
  body: null,
};

function normalizeMethod(method) {
  if (!method || typeof method !== 'string') return DEFAULT_FIELDS.method;
  return method.trim().toUpperCase();
}

function normalizePath(path) {
  if (!path || typeof path !== 'string') return DEFAULT_FIELDS.path;
  const trimmed = path.trim();
  return trimmed.startsWith('/') ? trimmed : '/' + trimmed;
}

function normalizeStatus(status) {
  const n = parseInt(status, 10);
  return isNaN(n) ? DEFAULT_FIELDS.status : n;
}

function normalizeDuration(duration) {
  const n = parseFloat(duration);
  return isNaN(n) || n < 0 ? DEFAULT_FIELDS.duration : n;
}

function normalizeTimestamp(ts) {
  if (!ts) return DEFAULT_FIELDS.timestamp;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? DEFAULT_FIELDS.timestamp : d.toISOString();
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object') return { ...DEFAULT_FIELDS };
  return {
    method: normalizeMethod(entry.method),
    path: normalizePath(entry.path),
    status: normalizeStatus(entry.status),
    duration: normalizeDuration(entry.duration),
    timestamp: normalizeTimestamp(entry.timestamp),
    headers: entry.headers && typeof entry.headers === 'object' ? entry.headers : {},
    body: entry.body !== undefined ? entry.body : null,
  };
}

function normalizeEntries(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.map(normalizeEntry);
}

module.exports = {
  normalizeMethod,
  normalizePath,
  normalizeStatus,
  normalizeDuration,
  normalizeTimestamp,
  normalizeEntry,
  normalizeEntries,
};
