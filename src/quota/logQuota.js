// logQuota.js — enforce per-key request quotas over a time window

function groupByKey(entries, keyFn) {
  const map = new Map();
  for (const entry of entries) {
    const k = keyFn(entry);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(entry);
  }
  return map;
}

function checkQuota(entries, keyFn, limit) {
  const map = groupByKey(entries, keyFn);
  const results = [];
  for (const [key, group] of map) {
    results.push({
      key,
      count: group.length,
      limit,
      exceeded: group.length > limit,
      entries: group,
    });
  }
  return results;
}

function quotaByPath(entries, limit) {
  return checkQuota(entries, e => e.path, limit);
}

function quotaByMethod(entries, limit) {
  return checkQuota(entries, e => e.method, limit);
}

function quotaByIp(entries, limit) {
  return checkQuota(entries, e => e.ip || 'unknown', limit);
}

function summarizeQuotas(results) {
  const exceeded = results.filter(r => r.exceeded);
  return {
    total: results.length,
    exceeded: exceeded.length,
    ok: results.length - exceeded.length,
    breaches: exceeded.map(r => ({ key: r.key, count: r.count, limit: r.limit })),
  };
}

function applyQuota(entries, { key = 'path', limit = 100 } = {}) {
  if (key === 'method') return quotaByMethod(entries, limit);
  if (key === 'ip') return quotaByIp(entries, limit);
  return quotaByPath(entries, limit);
}

module.exports = { checkQuota, quotaByPath, quotaByMethod, quotaByIp, summarizeQuotas, applyQuota };
