// summaryFormatter.js — formats a summary object for CLI output

'use strict';

/**
 * Format summary as a human-readable multi-line string.
 * @param {object} summary
 * @returns {string}
 */
function formatSummaryText(summary) {
  if (summary.total === 0) return 'No log entries to summarize.';

  const lines = [];
  lines.push(`Total Requests : ${summary.total}`);
  lines.push(`Error Rate     : ${(summary.errorRate * 100).toFixed(2)}%`);

  if (summary.latency) {
    const l = summary.latency;
    lines.push(`Latency (ms)   : min=${l.min}  p50=${l.p50}  p95=${l.p95}  p99=${l.p99}  max=${l.max}`);
  }

  lines.push(`Outliers       : ${summary.outlierCount}`);

  const methodStr = Object.entries(summary.methods)
    .map(([m, c]) => `${m}=${c}`).join('  ');
  lines.push(`Methods        : ${methodStr || 'none'}`);

  const statusStr = Object.entries(summary.statuses)
    .sort(([a], [b]) => a - b)
    .map(([s, c]) => `${s}=${c}`).join('  ');
  lines.push(`Statuses       : ${statusStr || 'none'}`);

  if (summary.budgetBreaches && summary.budgetBreaches.length > 0) {
    lines.push(`Budget Breaches: ${summary.budgetBreaches.map(b => b.type).join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Format summary as JSON string.
 * @param {object} summary
 * @returns {string}
 */
function formatSummaryJson(summary) {
  return JSON.stringify(summary, null, 2);
}

/**
 * Format summary as a compact single-line string.
 * @param {object} summary
 * @returns {string}
 */
function formatSummaryOneLine(summary) {
  if (summary.total === 0) return 'No entries.';
  const l = summary.latency || {};
  return [
    `total=${summary.total}`,
    `errors=${(summary.errorRate * 100).toFixed(1)}%`,
    `p50=${l.p50 ?? '-'}ms`,
    `p99=${l.p99 ?? '-'}ms`,
    `outliers=${summary.outlierCount}`,
  ].join(' | ');
}

module.exports = { formatSummaryText, formatSummaryJson, formatSummaryOneLine };
