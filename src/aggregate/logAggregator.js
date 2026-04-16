// logAggregator.js — aggregate log entries by field with metrics

function aggregateBy(entries, field) {
  const map = new Map();
  for (const entry of entries) {
    const key = entry[field] ?? '__unknown__';
    if (!map.has(key)) {
      map.set(key, { count: 0, totalLatency: 0, statuses: {} });
    }
    const bucket = map.get(key);
    bucket.count++;
    bucket.totalLatency += entry.duration ?? 0;
    const s = String(entry.status ?? 0);
    bucket.statuses[s] = (bucket.statuses[s] ?? 0) + 1;
  }
  return map;
}

function toAggregateRows(map) {
  return Array.from(map.entries()).map(([key, val]) => ({
    key,
    count: val.count,
    avgLatency: val.count ? Math.round(val.totalLatency / val.count) : 0,
    statuses: val.statuses,
  }));
}

function aggregateByMethod(entries) {
  return toAggregateRows(aggregateBy(entries, 'method'));
}

function aggregateByPath(entries) {
  return toAggregateRows(aggregateBy(entries, 'path'));
}

function aggregateByStatus(entries) {
  return toAggregateRows(aggregateBy(entries, 'status'));
}

function aggregateEntries(entries, field) {
  return toAggregateRows(aggregateBy(entries, field));
}

module.exports = { aggregateBy, toAggregateRows, aggregateByMethod, aggregateByPath, aggregateByStatus, aggregateEntries };
