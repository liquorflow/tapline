// logAlerter.js — trigger alerts when log entries match threshold conditions

function matchesAlert(entry, rule) {
  if (rule.method && entry.method !== rule.method) return false;
  if (rule.minLatency && entry.duration < rule.minLatency) return false;
  if (rule.maxLatency && entry.duration > rule.maxLatency) return false;
  if (rule.status && entry.status !== rule.status) return false;
  if (rule.statusGte && entry.status < rule.statusGte) return false;
  if (rule.pathPrefix && !entry.path.startsWith(rule.pathPrefix)) return false;
  return true;
}

function checkAlerts(entries, rules) {
  const triggered = [];
  for (const entry of entries) {
    for (const rule of rules) {
      if (matchesAlert(entry, rule)) {
        triggered.push({ rule: rule.name || 'unnamed', entry });
      }
    }
  }
  return triggered;
}

function summarizeAlerts(triggered) {
  const counts = {};
  for (const { rule } of triggered) {
    counts[rule] = (counts[rule] || 0) + 1;
  }
  return counts;
}

function formatAlerts(triggered) {
  if (triggered.length === 0) return 'No alerts triggered.';
  return triggered
    .map(({ rule, entry }) =>
      `[ALERT:${rule}] ${entry.method} ${entry.path} ${entry.status} ${entry.duration}ms`
    )
    .join('\n');
}

module.exports = { matchesAlert, checkAlerts, summarizeAlerts, formatAlerts };
