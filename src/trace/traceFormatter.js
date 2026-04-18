const { traceSpan } = require('./logTracer');

function formatTraceTable(traces) {
  const rows = Object.entries(traces).map(([id, entries]) => {
    const span = traceSpan(entries);
    const statuses = entries.map(e => e.status).join(', ');
    return `${id.padEnd(36)} | ${String(entries.length).padStart(5)} | ${String(span.durationMs).padStart(8)}ms | ${statuses}`;
  });
  const header = 'Trace ID                             | Count |  Duration | Statuses';
  const sep = '-'.repeat(70);
  return [header, sep, ...rows].join('\n');
}

function formatTraceJson(traces) {
  const out = Object.entries(traces).map(([id, entries]) => ({
    id,
    count: entries.length,
    span: traceSpan(entries),
    entries
  }));
  return JSON.stringify(out, null, 2);
}

function formatTraceSummary(traces) {
  const ids = Object.keys(traces);
  const total = ids.reduce((s, id) => s + traces[id].length, 0);
  return `Traces: ${ids.length} | Total entries: ${total}`;
}

module.exports = { formatTraceTable, formatTraceJson, formatTraceSummary };
