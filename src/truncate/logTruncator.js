// logTruncator.js — truncate log entry sets by various strategies

/**
 * Keep only the first n entries.
 * @param {object[]} entries
 * @param {number} n
 * @returns {object[]}
 */
function truncateHead(entries, n) {
  if (!Number.isInteger(n) || n < 0) throw new Error('n must be a non-negative integer');
  return entries.slice(0, n);
}

/**
 * Keep only the last n entries.
 * @param {object[]} entries
 * @param {number} n
 * @returns {object[]}
 */
function truncateTail(entries, n) {
  if (!Number.isInteger(n) || n < 0) throw new Error('n must be a non-negative integer');
  return entries.slice(Math.max(0, entries.length - n));
}

/**
 * Remove entries whose latency exceeds maxMs.
 * @param {object[]} entries
 * @param {number} maxMs
 * @returns {object[]}
 */
function truncateByLatency(entries, maxMs) {
  if (typeof maxMs !== 'number' || maxMs < 0) throw new Error('maxMs must be a non-negative number');
  return entries.filter(e => typeof e.duration === 'number' && e.duration <= maxMs);
}

/**
 * Truncate entries to a time window [startMs, endMs] based on entry.timestamp (ms).
 * @param {object[]} entries
 * @param {number} startMs
 * @param {number} endMs
 * @returns {object[]}
 */
function truncateByTimeWindow(entries, startMs, endMs) {
  if (typeof startMs !== 'number' || typeof endMs !== 'number') {
    throw new Error('startMs and endMs must be numbers');
  }
  if (startMs > endMs) throw new Error('startMs must be less than or equal to endMs');
  return entries.filter(e => {
    const t = new Date(e.timestamp).getTime();
    return t >= startMs && t <= endMs;
  });
}

/**
 * Apply a named truncation strategy.
 * @param {object[]} entries
 * @param {{ strategy: string, n?: number, maxMs?: number, startMs?: number, endMs?: number }} opts
 * @returns {object[]}
 */
function truncateEntries(entries, opts = {}) {
  if (!Array.isArray(entries)) throw new Error('entries must be an array');
  switch (opts.strategy) {
    case 'head':    return truncateHead(entries, opts.n);
    case 'tail':    return truncateTail(entries, opts.n);
    case 'latency': return truncateByLatency(entries, opts.maxMs);
    case 'window':  return truncateByTimeWindow(entries, opts.startMs, opts.endMs);
    default: throw new Error(`Unknown truncation strategy: ${opts.strategy}`);
  }
}

module.exports = { truncateHead, truncateTail, truncateByLatency, truncateByTimeWindow, truncateEntries };
