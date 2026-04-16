// logStats.js — compute summary statistics from parsed log entries

/**
 * Count entries grouped by HTTP method.
 * @param {object[]} entries
 * @returns {object}
 */
function countByMethod(entries) {
  return entries.reduce((acc, entry) => {
    const method = entry.method || 'UNKNOWN';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Count entries grouped by status code.
 * @param {object[]} entries
 * @returns {object}
 */
function countByStatus(entries) {
  return entries.reduce((acc, entry) => {
    const status = String(entry.status || 'UNKNOWN');
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Compute latency stats (min, max, avg, p95) from entries.
 * @param {object[]} entries
 * @returns {object}
 */
function latencyStats(entries) {
  const durations = entries
    .map(e => e.duration)
    .filter(d => typeof d === 'number' && !isNaN(d))
    .sort((a, b) => a - b);

  if (durations.length === 0) {
    return { min: null, max: null, avg: null, p95: null, count: 0 };
  }

  const sum = durations.reduce((a, b) => a + b, 0);
  const p95Index = Math.floor(durations.length * 0.95);

  return {
    min: durations[0],
    max: durations[durations.length - 1],
    avg: Math.round(sum / durations.length),
    p95: durations[p95Index] ?? durations[durations.length - 1],
    count: durations.length,
  };
}

/**
 * Build a full stats summary for a set of log entries.
 * @param {object[]} entries
 * @returns {object}
 */
function summarizeStats(entries) {
  return {
    total: entries.length,
    byMethod: countByMethod(entries),
    byStatus: countByStatus(entries),
    latency: latencyStats(entries),
  };
}

module.exports = { countByMethod, countByStatus, latencyStats, summarizeStats };
