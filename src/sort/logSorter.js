// logSorter.js — sort log entries by various fields

/**
 * Sort entries by timestamp ascending (or descending)
 */
function sortByTime(entries, desc = false) {
  const sorted = [...entries].sort((a, b) => {
    const ta = new Date(a.timestamp).getTime();
    const tb = new Date(b.timestamp).getTime();
    return ta - tb;
  });
  return desc ? sorted.reverse() : sorted;
}

/**
 * Sort entries by latency (ms) ascending or descending
 */
function sortByLatency(entries, desc = false) {
  const sorted = [...entries].sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0));
  return desc ? sorted.reverse() : sorted;
}

/**
 * Sort entries by HTTP status code
 */
function sortByStatus(entries, desc = false) {
  const sorted = [...entries].sort((a, b) => (a.status ?? 0) - (b.status ?? 0));
  return desc ? sorted.reverse() : sorted;
}

/**
 * Sort entries by path alphabetically
 */
function sortByPath(entries, desc = false) {
  const sorted = [...entries].sort((a, b) =>
    (a.path ?? '').localeCompare(b.path ?? '')
  );
  return desc ? sorted.reverse() : sorted;
}

/**
 * Generic sort dispatcher
 * @param {Array} entries
 * @param {string} field - 'time' | 'latency' | 'status' | 'path'
 * @param {boolean} desc
 */
function sortEntries(entries, field = 'time', desc = false) {
  switch (field) {
    case 'latency': return sortByLatency(entries, desc);
    case 'status':  return sortByStatus(entries, desc);
    case 'path':    return sortByPath(entries, desc);
    case 'time':
    default:        return sortByTime(entries, desc);
  }
}

module.exports = { sortByTime, sortByLatency, sortByStatus, sortByPath, sortEntries };
