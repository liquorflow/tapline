// logCorrelator.js — group entries into request/response chains by correlation id or timing

function byRequestId(entries) {
  const groups = {};
  for (const entry of entries) {
    const id = entry.requestId || entry.headers?.['x-request-id'];
    if (!id) continue;
    if (!groups[id]) groups[id] = [];
    groups[id].push(entry);
  }
  return groups;
}

function bySessionId(entries) {
  const groups = {};
  for (const entry of entries) {
    const id = entry.sessionId || entry.headers?.['x-session-id'];
    if (!id) continue;
    if (!groups[id]) groups[id] = [];
    groups[id].push(entry);
  }
  return groups;
}

function correlateByProximity(entries, windowMs = 500) {
  const sorted = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const chains = [];
  let current = [];

  for (let i = 0; i < sorted.length; i++) {
    if (current.length === 0) {
      current.push(sorted[i]);
    } else {
      const last = current[current.length - 1];
      const gap = new Date(sorted[i].timestamp) - new Date(last.timestamp);
      if (gap <= windowMs) {
        current.push(sorted[i]);
      } else {
        chains.push(current);
        current = [sorted[i]];
      }
    }
  }
  if (current.length > 0) chains.push(current);
  return chains;
}

function summarizeCorrelations(groups) {
  return Object.entries(groups).map(([id, entries]) => ({
    id,
    count: entries.length,
    methods: [...new Set(entries.map(e => e.method))],
    paths: [...new Set(entries.map(e => e.path))],
    statuses: [...new Set(entries.map(e => e.status))],
    totalLatency: entries.reduce((s, e) => s + (e.duration || 0), 0),
  }));
}

function correlateEntries(entries, { mode = 'requestId', windowMs = 500 } = {}) {
  if (mode === 'sessionId') return bySessionId(entries);
  if (mode === 'proximity') {
    const chains = correlateByProximity(entries, windowMs);
    return Object.fromEntries(chains.map((c, i) => [`chain_${i}`, c]));
  }
  return byRequestId(entries);
}

module.exports = { byRequestId, bySessionId, correlateByProximity, summarizeCorrelations, correlateEntries };
