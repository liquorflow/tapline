// Groups log entries into clusters based on path patterns and similarity

function normalizePath(path) {
  return path.replace(/\/[0-9a-f-]{8,}(?:\/|$)/g, '/:id/').replace(/\/\d+(?:\/|$)/g, '/:id/').replace(/\/$/, '');
}

function clusterByPathPattern(entries) {
  const clusters = {};
  for (const entry of entries) {
    const pattern = normalizePath(entry.path || '/');
    if (!clusters[pattern]) clusters[pattern] = [];
    clusters[pattern].push(entry);
  }
  return clusters;
}

function clusterByMethodAndPath(entries) {
  const clusters = {};
  for (const entry of entries) {
    const pattern = normalizePath(entry.path || '/');
    const key = `${entry.method} ${pattern}`;
    if (!clusters[key]) clusters[key] = [];
    clusters[key].push(entry);
  }
  return clusters;
}

function clusterByStatusRange(entries) {
  const clusters = { '2xx': [], '3xx': [], '4xx': [], '5xx': [], other: [] };
  for (const entry of entries) {
    const s = entry.status;
    if (s >= 200 && s < 300) clusters['2xx'].push(entry);
    else if (s >= 300 && s < 400) clusters['3xx'].push(entry);
    else if (s >= 400 && s < 500) clusters['4xx'].push(entry);
    else if (s >= 500 && s < 600) clusters['5xx'].push(entry);
    else clusters.other.push(entry);
  }
  return clusters;
}

function summarizeClusters(clusters) {
  return Object.entries(clusters).map(([key, entries]) => ({
    key,
    count: entries.length,
    avgLatency: entries.length
      ? Math.round(entries.reduce((s, e) => s + (e.duration || 0), 0) / entries.length)
      : 0,
    methods: [...new Set(entries.map(e => e.method))],
  }));
}

function clusterEntries(entries, by = 'path') {
  if (by === 'method') return clusterByMethodAndPath(entries);
  if (by === 'status') return clusterByStatusRange(entries);
  return clusterByPathPattern(entries);
}

module.exports = { normalizePath, clusterByPathPattern, clusterByMethodAndPath, clusterByStatusRange, summarizeClusters, clusterEntries };
