// correlateFormatter.js — format correlation summaries for display

const { summarizeCorrelations } = require('./logCorrelator');

function formatCorrelateTable(groups) {
  const rows = summarizeCorrelations(groups);
  if (rows.length === 0) return 'No correlations found.';
  const lines = ['ID                               | Count | Methods       | Statuses'];
  lines.push('-'.repeat(70));
  for (const r of rows) {
    const id = r.id.padEnd(32);
    const count = String(r.count).padEnd(5);
    const methods = r.methods.join(',').padEnd(13);
    const statuses = r.statuses.join(',');
    lines.push(`${id} | ${count} | ${methods} | ${statuses}`);
  }
  return lines.join('\n');
}

function formatCorrelateJson(groups) {
  return JSON.stringify(summarizeCorrelations(groups), null, 2);
}

function formatCorrelateSummary(groups) {
  const rows = summarizeCorrelations(groups);
  const total = rows.reduce((s, r) => s + r.count, 0);
  const avgLatency = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.totalLatency, 0) / rows.length)
    : 0;
  return `Correlation groups: ${rows.length} | Total entries: ${total} | Avg latency/group: ${avgLatency}ms`;
}

module.exports = { formatCorrelateTable, formatCorrelateJson, formatCorrelateSummary };
