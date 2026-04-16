// logDeduper.js — remove duplicate log entries based on configurable keys

/**
 * Generate a key for an entry based on specified fields.
 * @param {object} entry
 * @param {string[]} fields
 * @returns {string}
 */
function entryKey(entry, fields) {
  return fields.map(f => String(entry[f] ?? '')).join('|');
}

/**
 * Remove duplicate entries, keeping the first occurrence.
 * @param {object[]} entries
 * @param {string[]} fields - fields to consider for deduplication
 * @returns {object[]}
 */
function dedupeFirst(entries, fields = ['method', 'path', 'status']) {
  const seen = new Set();
  return entries.filter(entry => {
    const key = entryKey(entry, fields);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Remove duplicate entries, keeping the last occurrence.
 * @param {object[]} entries
 * @param {string[]} fields
 * @returns {object[]}
 */
function dedupeLast(entries, fields = ['method', 'path', 'status']) {
  const map = new Map();
  for (const entry of entries) {
    map.set(entryKey(entry, fields), entry);
  }
  return Array.from(map.values());
}

/**
 * Count how many duplicates exist in the entries.
 * @param {object[]} entries
 * @param {string[]} fields
 * @returns {number}
 */
function countDuplicates(entries, fields = ['method', 'path', 'status']) {
  const seen = new Set();
  let dupes = 0;
  for (const entry of entries) {
    const key = entryKey(entry, fields);
    if (seen.has(key)) dupes++;
    else seen.add(key);
  }
  return dupes;
}

/**
 * Main dedupe entry point with strategy selection.
 * @param {object[]} entries
 * @param {object} options
 * @param {'first'|'last'} options.strategy
 * @param {string[]} options.fields
 * @returns {object[]}
 */
function dedupeEntries(entries, { strategy = 'first', fields = ['method', 'path', 'status'] } = {}) {
  if (strategy === 'last') return dedupeLast(entries, fields);
  return dedupeFirst(entries, fields);
}

module.exports = { entryKey, dedupeFirst, dedupeLast, countDuplicates, dedupeEntries };
