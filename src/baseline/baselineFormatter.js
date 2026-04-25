// baselineFormatter.js — format baseline and comparison results

const { computeBaseline, compareToBaseline, baselineSummary } = require('./logBaseline');

function formatBaselineTable(baseline, comparison) {
  if (!baseline) return 'No baseline available.\n';
  const rows = [
    ['Metric', 'Baseline', comparison ? 'Current' : ''],
    ['Count', baseline.count, ''],
    ['Avg Latency', `${baseline.avgLatency}ms`, comparison ? `${baseline.avgLatency + comparison.latencyDelta}ms` : ''],
    ['p50 Latency', `${baseline.p50Latency}ms`, ''],
    ['p95 Latency', `${baseline.p95Latency}ms`, comparison ? `${baseline.p95Latency + comparison.p95Delta}ms` : ''],
    ['Error Rate', `${(baseline.errorRate * 100).toFixed(2)}%`, comparison ? `${((baseline.errorRate + comparison.errorRateDelta) * 100).toFixed(2)}%` : ''],
  ];
  const colWidths = rows[0].map((_, ci) => Math.max(...rows.map(r => String(r[ci]).length)));
  return rows.map(row =>
    row.map((cell, ci) => String(cell).padEnd(colWidths[ci])).join('  ')
  ).join('\n') + '\n';
}

function formatBaselineJson(baseline, comparison) {
  return JSON.stringify({ baseline, comparison }, null, 2);
}

function formatBaselineSummary(baseline, comparison) {
  return baselineSummary(baseline, comparison);
}

function formatBaseline(baseline, comparison, format = 'table') {
  if (format === 'json') return formatBaselineJson(baseline, comparison);
  if (format === 'summary') return formatBaselineSummary(baseline, comparison);
  return formatBaselineTable(baseline, comparison);
}

module.exports = { formatBaselineTable, formatBaselineJson, formatBaselineSummary, formatBaseline };
