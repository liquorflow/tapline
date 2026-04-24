// resampleFormatter.js — format resampled log output

const { colorizeStatus } = require('../formatter/outputFormatter');

function formatResampleTable(entries) {
  if (!entries.length) return 'No entries.';
  const header = ['Timestamp', 'Method', 'Path', 'Status', 'Duration', 'Samples'].join('\t');
  const rows = entries.map(e =>
    [
      e.timestamp,
      e.method,
      e.path,
      colorizeStatus(e.status),
      `${e.duration}ms`,
      e._sampleSize != null ? e._sampleSize : 1
    ].join('\t')
  );
  return [header, ...rows].join('\n');
}

function formatResampleJson(entries) {
  return JSON.stringify(entries, null, 2);
}

function formatResampleSummary(entries) {
  const total = entries.reduce((s, e) => s + (e._sampleSize || 1), 0);
  const avgDur = entries.length
    ? Math.round(entries.reduce((s, e) => s + (e.duration || 0), 0) / entries.length)
    : 0;
  return `Resampled: ${entries.length} buckets, ${total} original entries, avg duration ${avgDur}ms`;
}

module.exports = { formatResampleTable, formatResampleJson, formatResampleSummary };
