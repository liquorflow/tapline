// logAnnotator.js — add computed annotations to log entries

/**
 * Tag an entry with a latency tier label
 */
function tagLatency(entry) {
  const ms = entry.duration;
  let tier;
  if (ms == null) tier = 'unknown';
  else if (ms < 100) tier = 'fast';
  else if (ms < 500) tier = 'normal';
  else if (ms < 2000) tier = 'slow';
  else tier = 'critical';
  return { ...entry, _latencyTier: tier };
}

/**
 * Tag an entry with a status class (2xx, 3xx, 4xx, 5xx)
 */
function tagStatusClass(entry) {
  const code = entry.status;
  const cls = code ? `${Math.floor(code / 100)}xx` : 'unknown';
  return { ...entry, _statusClass: cls };
}

/**
 * Tag an entry with a flag if it looks like an error
 */
function tagError(entry) {
  const isError = entry.status >= 400;
  return { ...entry, _isError: isError };
}

/**
 * Apply a list of annotation functions to a single entry
 */
function annotateEntry(entry, annotators = [tagLatency, tagStatusClass, tagError]) {
  return annotators.reduce((e, fn) => fn(e), entry);
}

/**
 * Annotate all entries
 */
function annotateEntries(entries, annotators) {
  return entries.map(e => annotateEntry(e, annotators));
}

module.exports = { tagLatency, tagStatusClass, tagError, annotateEntry, annotateEntries };
