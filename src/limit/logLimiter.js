// logLimiter.js — limit log entries by count or time range

/**
 * Return first `n` entries.
 * @param {object[]} entries
 * @param {number} n
 */
function limitHead(entries, n) {
  return entries.slice(0, n);
}

/**
 * Return last `n` entries.
 * @param {object[]} entries
 * @param {number} n
 */
function limitTail(entries, n) {
  return entries.slice(-n);
}

/**
 * Return entries whose timestamp falls within [from, to] (inclusive).
 * @param {object[]} entries
 * @param {string|Date} from
 * @param {string|Date} to
 */
function limitByTimeRange(entries, from, to) {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  return entries.filter(e => {
    const t = new Date(e.timestamp).getTime();
    return t >= start && t <= end;
  });
}

/**
 * Return entries with latency <= maxMs.
 * @param {object[]} entries
 * @param {number} maxMs
 */
function limitByMaxLatency(entries, maxMs) {
  return entries.filter(e => e.duration <= maxMs);
}

/**
 * General-purpose limit dispatcher.
 * @param {object[]} entries
 * @param {object} opts
 * @param {'head'|'tail'|'time'|'latency'} opts.mode
 * @param {number} [opts.n]
 * @param {string} [opts.from]
 * @param {string} [opts.to]
 * @param {number} [opts.maxMs]
 */
function limitEntries(entries, opts = {}) {
  switch (opts.mode) {
    case 'head': return limitHead(entries, opts.n ?? 10);
    case 'tail': return limitTail(entries, opts.n ?? 10);
    case 'time': return limitByTimeRange(entries, opts.from, opts.to);
    case 'latency': return limitByMaxLatency(entries, opts.maxMs ?? Infinity);
    default: return entries;
  }
}

module.exports = { limitHead, limitTail, limitByTimeRange, limitByMaxLatency, limitEntries };
