// logHighlighter.js — highlight matching patterns in log entries

const COLORS = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function highlightText(text, pattern, color = 'yellow') {
  if (!pattern) return text;
  const colorFn = COLORS[color] || COLORS.yellow;
  const regex = pattern instanceof RegExp ? pattern : new RegExp(escapeRegex(pattern), 'gi');
  return String(text).replace(regex, (match) => colorFn(match));
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightEntry(entry, pattern, fields = ['path', 'method']) {
  if (!entry || !pattern) return entry;
  const result = { ...entry };
  for (const field of fields) {
    if (result[field] !== undefined) {
      result[field] = highlightText(String(result[field]), pattern);
    }
  }
  return result;
}

function highlightEntries(entries, pattern, fields) {
  if (!pattern) return entries;
  return entries.map((e) => highlightEntry(e, pattern, fields));
}

function highlightByStatus(entry) {
  if (!entry) return entry;
  const status = entry.status;
  let colorFn;
  if (status >= 500) colorFn = COLORS.red;
  else if (status >= 400) colorFn = COLORS.yellow;
  else if (status >= 300) colorFn = COLORS.cyan;
  else colorFn = COLORS.green;
  return { ...entry, status: colorFn(String(status)) };
}

module.exports = { highlightText, highlightEntry, highlightEntries, highlightByStatus, COLORS };
