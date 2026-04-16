// Merge multiple log entry arrays into one unified stream

/**
 * Merge two entry arrays, interleaving by timestamp
 * @param {object[]} a
 * @param {object[]} b
 * @returns {object[]}
 */
function mergeSorted(a, b) {
  const result = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    const ta = new Date(a[i].timestamp).getTime();
    const tb = new Date(b[j].timestamp).getTime();
    if (ta <= tb) result.push(a[i++]);
    else result.push(b[j++]);
  }
  while (i < a.length) result.push(a[i++]);
  while (j < b.length) result.push(b[j++]);
  return result;
}

/**
 * Merge multiple arrays of log entries sorted by timestamp
 * @param {object[][]} sources
 * @returns {object[]}
 */
function mergeAll(sources) {
  if (!sources || sources.length === 0) return [];
  return sources.reduce((acc, src) => mergeSorted(acc, src), []);
}

/**
 * Merge and deduplicate by a key (default: method+path+timestamp)
 * @param {object[][]} sources
 * @param {function} [keyFn]
 * @returns {object[]}
 */
function mergeUnique(sources, keyFn) {
  const key = keyFn || (e => `${e.method}|${e.path}|${e.timestamp}`);
  const merged = mergeAll(sources);
  const seen = new Set();
  return merged.filter(e => {
    const k = key(e);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Tag each entry with a source label
 * @param {object[]} entries
 * @param {string} label
 * @returns {object[]}
 */
function tagSource(entries, label) {
  return entries.map(e => ({ ...e, _source: label }));
}

module.exports = { mergeSorted, mergeAll, mergeUnique, tagSource };
