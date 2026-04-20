// cacheFormatter.js — format cache stats for CLI output

function formatCacheTable(stats) {
  const rows = [
    ['Active entries', stats.active],
    ['Expired entries', stats.expired],
    ['Total slots', stats.total],
    ['Hit rate', stats.hitRate != null ? `${(stats.hitRate * 100).toFixed(1)}%` : 'n/a'],
  ];
  const label = 'Cache Stats';
  const width = 22;
  const lines = [`${label}`, '-'.repeat(width)];
  for (const [k, v] of rows) {
    lines.push(`${k.padEnd(18)} ${String(v).padStart(6)}`);
  }
  return lines.join('\n');
}

function formatCacheJson(stats) {
  return JSON.stringify(stats, null, 2);
}

function formatCacheSummary(stats) {
  const rate = stats.hitRate != null ? ` | hit rate ${(stats.hitRate * 100).toFixed(1)}%` : '';
  return `cache: ${stats.active} active, ${stats.expired} expired${rate}`;
}

module.exports = { formatCacheTable, formatCacheJson, formatCacheSummary };
