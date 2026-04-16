// aggregateFormatter.js — format aggregate rows for display

function formatAggregateTable(rows) {
  if (!rows.length) return 'No data.';
  const header = ['Key', 'Count', 'Avg Latency (ms)', 'Statuses'];
  const lines = [header.join('\t')];
  for (const row of rows) {
    const statusStr = Object.entries(row.statuses)
      .map(([k, v]) => `${k}:${v}`)
      .join(' ');
    lines.push([row.key, row.count, row.avgLatency, statusStr].join('\t'));
  }
  return lines.join('\n');
}

function formatAggregateJson(rows) {
  return JSON.stringify(rows, null, 2);
}

function formatAggregateSummary(rows) {
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const topRow = rows.slice().sort((a, b) => b.count - a.count)[0];
  return `Total entries: ${total}\nTop key: ${topRow?.key ?? 'n/a'} (${topRow?.count ?? 0} hits)`;
}

module.exports = { formatAggregateTable, formatAggregateJson, formatAggregateSummary };
