// alertFormatter.js — format alert results for CLI output

const { summarizeAlerts } = require('./logAlerter');

function formatAlertTable(triggered) {
  if (triggered.length === 0) return 'No alerts triggered.\n';
  const rows = triggered.map(({ rule, entry }) => ({
    Rule: rule,
    Method: entry.method,
    Path: entry.path,
    Status: entry.status,
    'Duration(ms)': entry.duration,
  }));
  const keys = Object.keys(rows[0]);
  const widths = keys.map(k =>
    Math.max(k.length, ...rows.map(r => String(r[k]).length))
  );
  const header = keys.map((k, i) => k.padEnd(widths[i])).join('  ');
  const divider = widths.map(w => '-'.repeat(w)).join('  ');
  const lines = rows.map(r =>
    keys.map((k, i) => String(r[k]).padEnd(widths[i])).join('  ')
  );
  return [header, divider, ...lines].join('\n') + '\n';
}

function formatAlertJson(triggered) {
  return JSON.stringify(triggered.map(({ rule, entry }) => ({ rule, entry })), null, 2);
}

function formatAlertSummary(triggered) {
  const counts = summarizeAlerts(triggered);
  const total = triggered.length;
  const lines = Object.entries(counts).map(([rule, n]) => `  ${rule}: ${n}`);
  return `Alerts triggered: ${total}\n${lines.join('\n')}`;
}

module.exports = { formatAlertTable, formatAlertJson, formatAlertSummary };
