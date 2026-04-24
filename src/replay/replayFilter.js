// replayFilter.js — filter replay entries before dispatch

/**
 * Returns true if the entry method matches the allowed list.
 * @param {object} entry
 * @param {string[]} methods
 */
function filterByMethod(entry, methods) {
  if (!methods || methods.length === 0) return true;
  return methods.map(m => m.toUpperCase()).includes((entry.method || '').toUpperCase());
}

/**
 * Returns true if the entry status matches the allowed list.
 * @param {object} entry
 * @param {number[]} statuses
 */
function filterByStatus(entry, statuses) {
  if (!statuses || statuses.length === 0) return true;
  return statuses.includes(Number(entry.status));
}

/**
 * Returns true if the entry path matches the given prefix or regex string.
 * @param {object} entry
 * @param {string} pathPattern
 */
function filterByPath(entry, pathPattern) {
  if (!pathPattern) return true;
  try {
    const re = new RegExp(pathPattern);
    return re.test(entry.path || '');
  } catch {
    return (entry.path || '').startsWith(pathPattern);
  }
}

/**
 * Returns true if entry latency is within the given max (ms).
 * @param {object} entry
 * @param {number|null} maxLatency
 */
function filterByLatency(entry, maxLatency) {
  if (maxLatency == null) return true;
  return (entry.duration || 0) <= maxLatency;
}

/**
 * Apply all replay filters to a list of entries.
 * @param {object[]} entries
 * @param {object} opts
 * @param {string[]} [opts.methods]
 * @param {number[]} [opts.statuses]
 * @param {string}   [opts.pathPattern]
 * @param {number}   [opts.maxLatency]
 * @returns {object[]}
 */
function applyReplayFilters(entries, opts = {}) {
  return entries.filter(entry =>
    filterByMethod(entry, opts.methods) &&
    filterByStatus(entry, opts.statuses) &&
    filterByPath(entry, opts.pathPattern) &&
    filterByLatency(entry, opts.maxLatency)
  );
}

module.exports = { filterByMethod, filterByStatus, filterByPath, filterByLatency, applyReplayFilters };
