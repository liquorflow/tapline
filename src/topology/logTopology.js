// logTopology.js — build a call graph / topology from HTTP log entries

/**
 * Extract a topology edge from an entry.
 * Uses x-forwarded-for or a `source` field if present, otherwise 'client'.
 */
function toEdge(entry) {
  const from = entry.source || entry.headers?.['x-forwarded-for'] || 'client';
  const to = entry.host || 'server';
  const key = `${from}->${to}:${entry.method}:${entry.path}`;
  return { from, to, method: entry.method, path: entry.path, key };
}

/**
 * Build a topology map: edge key -> { from, to, method, path, count, totalLatency }
 */
function buildTopology(entries) {
  const map = new Map();
  for (const entry of entries) {
    const edge = toEdge(entry);
    if (!map.has(edge.key)) {
      map.set(edge.key, { ...edge, count: 0, totalLatency: 0, errors: 0 });
    }
    const node = map.get(edge.key);
    node.count += 1;
    node.totalLatency += entry.duration ?? entry.latency ?? 0;
    if (entry.status >= 500) node.errors += 1;
  }
  return map;
}

/**
 * Convert topology map to a sorted array of rows.
 */
function topologyToRows(map) {
  return Array.from(map.values())
    .map(n => ({
      from: n.from,
      to: n.to,
      method: n.method,
      path: n.path,
      count: n.count,
      avgLatency: n.count ? Math.round(n.totalLatency / n.count) : 0,
      errors: n.errors,
      errorRate: n.count ? +(n.errors / n.count).toFixed(3) : 0
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Return a short summary of the topology.
 */
function summarizeTopology(map) {
  const rows = topologyToRows(map);
  const totalEdges = rows.length;
  const totalCalls = rows.reduce((s, r) => s + r.count, 0);
  const hottest = rows[0] ?? null;
  return { totalEdges, totalCalls, hottest };
}

module.exports = { toEdge, buildTopology, topologyToRows, summarizeTopology };
