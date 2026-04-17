// enrichFormatter.js — formats enriched log entries for display

const DURATION_COLORS = { fast: '\x1b[32m', medium: '\x1b[33m', slow: '\x1b[31m' };
const RESET = '\x1b[0m';

function formatDurationClass(cls) {
  if (!cls) return '';
  const color = DURATION_COLORS[cls] || '';
  return `${color}[${cls}]${RESET}`;
}

function formatEnrichedEntry(entry) {
  const parts = [
    entry.requestId ? `#${entry.requestId}` : '',
    entry.method || '-',
    entry.path || '-',
    entry.status || '-',
    entry.latency != null ? `${entry.latency}ms` : '',
    formatDurationClass(entry.durationClass),
    entry.host ? `host:${entry.host}` : '',
    entry.weekday ? `${entry.weekday} ${entry.hour}h` : ''
  ].filter(Boolean);
  return parts.join(' ');
}

function formatEnrichedTable(entries) {
  const header = ['id', 'method', 'path', 'status', 'latency', 'class', 'host'].join('\t');
  const rows = entries.map(e => [
    e.requestId || '-',
    e.method || '-',
    e.path || '-',
    e.status || '-',
    e.latency != null ? `${e.latency}ms` : '-',
    e.durationClass || '-',
    e.host || '-'
  ].join('\t'));
  return [header, ...rows].join('\n');
}

function formatEnrichedJson(entries) {
  return JSON.stringify(entries, null, 2);
}

module.exports = { formatDurationClass, formatEnrichedEntry, formatEnrichedTable, formatEnrichedJson };
