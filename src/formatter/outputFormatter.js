/**
 * outputFormatter.js
 * Formats parsed log entries for CLI output (table, json, pretty)
 */

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function colorizeStatus(status) {
  if (status >= 500) return `${COLORS.red}${status}${COLORS.reset}`;
  if (status >= 400) return `${COLORS.yellow}${status}${COLORS.reset}`;
  if (status >= 200) return `${COLORS.green}${status}${COLORS.reset}`;
  return `${COLORS.dim}${status}${COLORS.reset}`;
}

function formatPretty(entry) {
  const status = colorizeStatus(entry.status);
  const method = `${COLORS.cyan}${entry.method.padEnd(7)}${COLORS.reset}`;
  const duration = entry.duration != null ? ` ${COLORS.dim}(${entry.duration}ms)${COLORS.reset}` : '';
  return `${method} ${entry.path} → ${status}${duration}`;
}

function formatTable(entries) {
  const header = ['METHOD', 'PATH', 'STATUS', 'DURATION'].map(h => h.padEnd(12)).join(' ');
  const divider = '-'.repeat(header.length);
  const rows = entries.map(entry => {
    const duration = entry.duration != null ? `${entry.duration}ms` : 'N/A';
    return [
      entry.method.padEnd(12),
      entry.path.slice(0, 40).padEnd(12),
      String(entry.status).padEnd(12),
      duration.padEnd(12),
    ].join(' ');
  });
  return [header, divider, ...rows].join('\n');
}

function formatJson(entries) {
  return JSON.stringify(entries, null, 2);
}

function formatEntries(entries, mode = 'pretty') {
  if (!Array.isArray(entries) || entries.length === 0) {
    return 'No log entries to display.';
  }

  switch (mode) {
    case 'json':
      return formatJson(entries);
    case 'table':
      return formatTable(entries);
    case 'pretty':
    default:
      return entries.map(formatPretty).join('\n');
  }
}

module.exports = { formatPretty, formatTable, formatJson, formatEntries };
