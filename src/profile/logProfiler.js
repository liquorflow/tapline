// logProfiler.js — build performance profiles from log entries

function profileByPath(entries) {
  const map = {};
  for (const e of entries) {
    const key = e.path || 'unknown';
    if (!map[key]) map[key] = { path: key, count: 0, totalLatency: 0, errors: 0 };
    map[key].count++;
    map[key].totalLatency += e.latency || 0;
    if (e.status >= 400) map[key].errors++;
  }
  return Object.values(map).map(p => ({
    ...p,
    avgLatency: p.count ? Math.round(p.totalLatency / p.count) : 0,
    errorRate: p.count ? +(p.errors / p.count).toFixed(3) : 0
  }));
}

function profileByMethod(entries) {
  const map = {};
  for (const e of entries) {
    const key = e.method || 'UNKNOWN';
    if (!map[key]) map[key] = { method: key, count: 0, totalLatency: 0, errors: 0 };
    map[key].count++;
    map[key].totalLatency += e.latency || 0;
    if (e.status >= 400) map[key].errors++;
  }
  return Object.values(map).map(p => ({
    ...p,
    avgLatency: p.count ? Math.round(p.totalLatency / p.count) : 0,
    errorRate: p.count ? +(p.errors / p.count).toFixed(3) : 0
  }));
}

function topSlowPaths(entries, n = 5) {
  const profiles = profileByPath(entries);
  return profiles.sort((a, b) => b.avgLatency - a.avgLatency).slice(0, n);
}

function summarizeProfile(entries) {
  const total = entries.length;
  const totalLatency = entries.reduce((s, e) => s + (e.latency || 0), 0);
  const errors = entries.filter(e => e.status >= 400).length;
  return {
    total,
    avgLatency: total ? Math.round(totalLatency / total) : 0,
    errorRate: total ? +(errors / total).toFixed(3) : 0,
    byMethod: profileByMethod(entries),
    topSlowPaths: topSlowPaths(entries, 5)
  };
}

module.exports = { profileByPath, profileByMethod, topSlowPaths, summarizeProfile };
