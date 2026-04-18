// Trace request flows across log entries by correlating shared identifiers

function buildTraceMap(entries) {
  const map = new Map();
  for (const entry of entries) {
    const key = entry.requestId || entry.traceId;
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(entry);
  }
  return map;
}

function traceById(entries, id) {
  return entries.filter(e => e.requestId === id || e.traceId === id);
}

function buildTrace(entries) {
  return [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function traceSpan(entries) {
  if (!entries.length) return { start: null, end: null, durationMs: 0 };
  const times = entries.map(e => new Date(e.timestamp).getTime()).filter(Boolean);
  const start = Math.min(...times);
  const end = Math.max(...times);
  return { start: new Date(start).toISOString(), end: new Date(end).toISOString(), durationMs: end - start };
}

function summarizeTraces(entries) {
  const map = buildTraceMap(entries);
  const results = [];
  for (const [id, group] of map.entries()) {
    const span = traceSpan(group);
    results.push({ id, count: group.length, ...span });
  }
  return results;
}

function traceEntries(entries) {
  const map = buildTraceMap(entries);
  const traces = {};
  for (const [id, group] of map.entries()) {
    traces[id] = buildTrace(group);
  }
  return traces;
}

module.exports = { buildTraceMap, traceById, buildTrace, traceSpan, summarizeTraces, traceEntries };
