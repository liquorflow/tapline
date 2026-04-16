// logGrouper.js — group log entries by a given field

/**
 * Group entries by a field value (e.g. method, status, path)
 * @param {object[]} entries
 * @param {string} field
 * @returns {object} map of fieldValue -> entries[]
 */
function groupBy(entries, field) {
  const groups = {};
  for (const entry of entries) {
    const key = entry[field] ?? '__unknown__';
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return groups;
}

/**
 * Group entries by latency bucket (fast/medium/slow)
 * @param {object[]} entries
 * @param {object} thresholds
 * @returns {object}
 */
function groupByLatency(entries, thresholds = { fast: 200, medium: 1000 }) {
  const groups = { fast: [], medium: [], slow: [] };
  for (const entry of entries) {
    const ms = entry.duration ?? 0;
    if (ms <= thresholds.fast) groups.fast.push(entry);
    else if (ms <= thresholds.medium) groups.medium.push(entry);
    else groups.slow.push(entry);
  }
  return groups;
}

/**
 * Summarize groups as counts
 * @param {object} groups
 * @returns {object}
 */
function summarizeGroups(groups) {
  const summary = {};
  for (const [key, entries] of Object.entries(groups)) {
    summary[key] = entries.length;
  }
  return summary;
}

/**
 * Group entries using one of the supported strategies
 * @param {object[]} entries
 * @param {string} by — 'method' | 'status' | 'path' | 'latency'
 * @param {object} [options]
 * @returns {object}
 */
function groupEntries(entries, by, options = {}) {
  if (by === 'latency') return groupByLatency(entries, options.thresholds);
  return groupBy(entries, by);
}

module.exports = { groupBy, groupByLatency, summarizeGroups, groupEntries };
