/**
 * logDiff.js
 * Compare two sets of log entries and surface differences.
 */

/**
 * Compare two log entry arrays and return added, removed, and changed entries.
 * Entries are matched by method + path combination.
 *
 * @param {Object[]} baseEntries
 * @param {Object[]} compareEntries
 * @returns {{ added: Object[], removed: Object[], changed: Object[] }}
 */
function diffEntries(baseEntries, compareEntries) {
  const baseMap = new Map(baseEntries.map((e) => [`${e.method}:${e.path}`, e]));
  const compareMap = new Map(
    compareEntries.map((e) => [`${e.method}:${e.path}`, e])
  );

  const added = [];
  const removed = [];
  const changed = [];

  for (const [key, entry] of compareMap) {
    if (!baseMap.has(key)) {
      added.push(entry);
    } else {
      const base = baseMap.get(key);
      const delta = getChangedFields(base, entry);
      if (Object.keys(delta).length > 0) {
        changed.push({ key, base, compare: entry, delta });
      }
    }
  }

  for (const [key, entry] of baseMap) {
    if (!compareMap.has(key)) {
      removed.push(entry);
    }
  }

  return { added, removed, changed };
}

/**
 * Return fields that differ between two log entries.
 *
 * @param {Object} base
 * @param {Object} compare
 * @returns {Object}
 */
function getChangedFields(base, compare) {
  const fields = ['status', 'duration', 'size'];
  const delta = {};
  for (const field of fields) {
    if (base[field] !== compare[field]) {
      delta[field] = { from: base[field], to: compare[field] };
    }
  }
  return delta;
}

/**
 * Summarise a diff result as a human-readable string.
 *
 * @param {{ added: Object[], removed: Object[], changed: Object[] }} diff
 * @returns {string}
 */
function summarizeDiff(diff) {
  const lines = [];
  lines.push(`Added:   ${diff.added.length}`);
  lines.push(`Removed: ${diff.removed.length}`);
  lines.push(`Changed: ${diff.changed.length}`);
  return lines.join('\n');
}

module.exports = { diffEntries, getChangedFields, summarizeDiff };
