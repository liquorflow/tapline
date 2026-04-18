// timelineFormatter.js — format timeline summaries for output

const { summarizeTimeline } = require('./logTimeline');

function formatTimelineTable(buckets) {
  const rows = summarizeTimeline(buckets);
  if (!rows.length) return 'No timeline data.';

  const header = ['Window', 'Count', 'Avg Latency (ms)', 'Errors'];
  const lines = [header.join('\t')];
  for (const r of rows) {
    lines.push([r.windowStart, r.count, r.avgLatency, r.errorCount].join('\t'));
  }
  return lines.join('\n');
}

function formatTimelineJson(buckets) {
  return JSON.stringify(summarizeTimeline(buckets), null, 2);
}

function formatTimelineSummary(buckets, span) {
  const rows = summarizeTimeline(buckets);
  const totalRequests = rows.reduce((s, r) => s + r.count, 0);
  const totalErrors = rows.reduce((s, r) => s + r.errorCount, 0);
  const lines = [
    `Timeline: ${rows.length} bucket(s)`,
    span ? `Span: ${span.first} → ${span.last} (${span.durationMs}ms)` : '',
    `Total requests: ${totalRequests}`,
    `Total errors:   ${totalErrors}`
  ];
  return lines.filter(Boolean).join('\n');
}

module.exports = { formatTimelineTable, formatTimelineJson, formatTimelineSummary };
