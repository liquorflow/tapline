/**
 * replayUtils.js
 * Utility helpers for the replay scheduler and runner.
 */

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build a summary object from an array of replay results.
 * @param {object[]} results
 * @returns {object}
 */
function summarizeResults(results) {
  const total = results.length;
  const succeeded = results.filter((r) => r.success).length;
  const failed = total - succeeded;
  const statusCounts = {};

  for (const r of results) {
    const code = r.status || 'error';
    statusCounts[code] = (statusCounts[code] || 0) + 1;
  }

  const latencies = results.filter((r) => r.latency != null).map((r) => r.latency);
  const avgLatency =
    latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : null;

  return { total, succeeded, failed, statusCounts, avgLatency };
}

/**
 * Format a replay summary as a human-readable string.
 * @param {object} summary
 * @returns {string}
 */
function formatSummary(summary) {
  const lines = [
    `Total: ${summary.total}`,
    `Succeeded: ${summary.succeeded}`,
    `Failed: ${summary.failed}`,
  ];
  if (summary.avgLatency !== null) {
    lines.push(`Avg latency: ${summary.avgLatency}ms`);
  }
  const statusLine = Object.entries(summary.statusCounts)
    .map(([k, v]) => `${k}(${v})`)
    .join(', ');
  if (statusLine) lines.push(`Status codes: ${statusLine}`);
  return lines.join('  |  ');
}

module.exports = { sleep, summarizeResults, formatSummary };
