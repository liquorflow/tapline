// profileFormatter.js — format profiler output

function formatProfileTable(profiles, field = 'path') {
  const rows = profiles.map(p => {
    const key = p[field] || '-';
    return `  ${key.padEnd(40)} count=${p.count}  avgLatency=${p.avgLatency}ms  errorRate=${p.errorRate}`;
  });
  return [`[Profile by ${field}]`, ...rows].join('\n');
}

function formatProfileJson(summary) {
  return JSON.stringify(summary, null, 2);
}

function formatProfileSummary(summary) {
  const lines = [
    `Total requests : ${summary.total}`,
    `Avg latency    : ${summary.avgLatency}ms`,
    `Error rate     : ${(summary.errorRate * 100).toFixed(1)}%`,
    '',
    'Top slow paths:'
  ];
  for (const p of summary.topSlowPaths) {
    lines.push(`  ${p.path.padEnd(40)} ${p.avgLatency}ms`);
  }
  return lines.join('\n');
}

module.exports = { formatProfileTable, formatProfileJson, formatProfileSummary };
