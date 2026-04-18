// pivotFormatter.js — format pivot rows for display

function formatPivotTable(rows) {
  if (!rows.length) return 'No data.';
  const header = ['Key', 'Count', 'Avg Latency (ms)', 'Top Status'].join('\t');
  const lines = rows.map(r => {
    const topStatus = Object.entries(r.statuses).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
    return [r.key, r.count, r.avgLatency, topStatus].join('\t');
  });
  return [header, ...lines].join('\n');
}

function formatPivotJson(rows) {
  return JSON.stringify(rows, null, 2);
}

function formatPivotSummary(rows) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  const top = rows[0];
  return `Pivot: ${rows.length} keys, ${total} total entries. Top: "${top?.key ?? '-'}" (${top?.count ?? 0})`;
}

module.exports = { formatPivotTable, formatPivotJson, formatPivotSummary };
