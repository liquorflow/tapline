// logRanker.js — rank log entries by composite score or single field

function rankByLatency(entries) {
  return [...entries].sort((a, b) => (b.duration || 0) - (a.duration || 0))
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

function rankByErrorRate(entries) {
  const pathMap = {};
  for (const e of entries) {
    const p = e.path || 'unknown';
    if (!pathMap[p]) pathMap[p] = { total: 0, errors: 0 };
    pathMap[p].total++;
    if (e.status >= 400) pathMap[p].errors++;
  }
  return Object.entries(pathMap)
    .map(([path, s]) => ({ path, total: s.total, errors: s.errors, errorRate: s.errors / s.total }))
    .sort((a, b) => b.errorRate - a.errorRate)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

function rankByFrequency(entries) {
  const counts = {};
  for (const e of entries) {
    const key = e.path || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

function rankEntries(entries, by = 'latency') {
  if (by === 'latency') return rankByLatency(entries);
  if (by === 'errorRate') return rankByErrorRate(entries);
  if (by === 'frequency') return rankByFrequency(entries);
  throw new Error(`Unknown ranking field: ${by}`);
}

module.exports = { rankByLatency, rankByErrorRate, rankByFrequency, rankEntries };
