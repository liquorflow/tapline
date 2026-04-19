// quotaFormatter.js — format quota results for display

function bar(ratio, width = 20) {
  const filled = Math.round(Math.min(ratio, 1) * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

function formatQuotaTable(results) {
  const lines = ['Key                  Count  Limit  Status'];
  lines.push('-'.repeat(46));
  for (const r of results) {
    const status = r.exceeded ? 'EXCEEDED' : 'ok';
    const ratio = r.limit > 0 ? r.count / r.limit : 1;
    lines.push(
      `${r.key.padEnd(20)} ${String(r.count).padStart(5)}  ${String(r.limit).padStart(5)}  ${bar(ratio, 10)} ${status}`
    );
  }
  return lines.join('\n');
}

function formatQuotaJson(results) {
  return JSON.stringify(results, null, 2);
}

function formatQuotaSummary(summary) {
  const lines = [
    `Total keys : ${summary.total}`,
    `OK         : ${summary.ok}`,
    `Exceeded   : ${summary.exceeded}`,
  ];
  if (summary.breaches.length) {
    lines.push('Breaches:');
    for (const b of summary.breaches) {
      lines.push(`  ${b.key}: ${b.count}/${b.limit}`);
    }
  }
  return lines.join('\n');
}

module.exports = { formatQuotaTable, formatQuotaJson, formatQuotaSummary };
