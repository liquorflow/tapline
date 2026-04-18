// logPivot.js — pivot log entries by a field, aggregating counts and latency

function pivotBy(entries, field) {
  const table = {};
  for (const entry of entries) {
    const key = entry[field] ?? '(unknown)';
    if (!table[key]) table[key] = { count: 0, totalLatency: 0, statuses: {} };
    table[key].count++;
    table[key].totalLatency += entry.duration ?? 0;
    const s = String(entry.status ?? 'unknown');
    table[key].statuses[s] = (table[key].statuses[s] ?? 0) + 1;
  }
  return table;
}

function pivotToRows(table) {
  return Object.entries(table).map(([key, val]) => ({
    key,
    count: val.count,
    avgLatency: val.count ? Math.round(val.totalLatency / val.count) : 0,
    statuses: val.statuses,
  }));
}

function topN(rows, n = 10) {
  return [...rows].sort((a, b) => b.count - a.count).slice(0, n);
}

function pivotEntries(entries, { field = 'method', limit = null } = {}) {
  const table = pivotBy(entries, field);
  let rows = pivotToRows(table);
  if (limit) rows = topN(rows, limit);
  return rows;
}

module.exports = { pivotBy, pivotToRows, topN, pivotEntries };
