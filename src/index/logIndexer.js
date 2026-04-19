// logIndexer.js — build searchable indexes over log entries

/**
 * Build an index mapping field values to entry arrays.
 * @param {object[]} entries
 * @param {string} field
 * @returns {Map<string, object[]>}
 */
function buildIndex(entries, field) {
  const index = new Map();
  for (const entry of entries) {
    const key = String(entry[field] ?? '__unknown__');
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(entry);
  }
  return index;
}

/**
 * Look up entries by a field value.
 * @param {Map} index
 * @param {string} value
 * @returns {object[]}
 */
function lookup(index, value) {
  return index.get(String(value)) ?? [];
}

/**
 * Build multiple indexes at once.
 * @param {object[]} entries
 * @param {string[]} fields
 * @returns {object} map of field -> Map index
 */
function buildIndexes(entries, fields) {
  const result = {};
  for (const field of fields) {
    result[field] = buildIndex(entries, field);
  }
  return result;
}

/**
 * Search entries where field matches any of the given values.
 * @param {Map} index
 * @param {string[]} values
 * @returns {object[]}
 */
function lookupAny(index, values) {
  const seen = new Set();
  const results = [];
  for (const val of values) {
    for (const entry of lookup(index, val)) {
      if (!seen.has(entry)) {
        seen.add(entry);
        results.push(entry);
      }
    }
  }
  return results;
}

/**
 * Summarize index key distribution.
 * @param {Map} index
 * @returns {object[]}
 */
function summarizeIndex(index) {
  return Array.from(index.entries())
    .map(([key, entries]) => ({ key, count: entries.length }))
    .sort((a, b) => b.count - a.count);
}

module.exports = { buildIndex, lookup, buildIndexes, lookupAny, summarizeIndex };
