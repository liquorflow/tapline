// logBaseline.js — compute and compare baseline metrics from log entries

function computeBaseline(entries) {
  if (!entries || entries.length === 0) return null;

  const durations = entries.map(e => e.duration).filter(d => typeof d === 'number');
  const statuses = entries.map(e => e.status).filter(Boolean);
  const methods = entries.map(e => e.method).filter(Boolean);

  const avgLatency = durations.length
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;

  const errorCount = statuses.filter(s => s >= 400).length;
  const errorRate = statuses.length ? errorCount / statuses.length : 0;

  const methodCounts = {};
  for (const m of methods) {
    methodCounts[m] = (methodCounts[m] || 0) + 1;
  }

  const p95 = percentile(durations, 0.95);
  const p50 = percentile(durations, 0.5);

  return {
    count: entries.length,
    avgLatency: Math.round(avgLatency),
    p50Latency: p50,
    p95Latency: p95,
    errorRate: parseFloat(errorRate.toFixed(4)),
    methodCounts,
  };
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const arr = [...sorted].sort((a, b) => a - b);
  const idx = Math.floor(arr.length * p);
  return arr[Math.min(idx, arr.length - 1)];
}

function compareToBaseline(current, baseline) {
  if (!current || !baseline) return null;

  const latencyDelta = current.avgLatency - baseline.avgLatency;
  const latencyPct = baseline.avgLatency
    ? parseFloat(((latencyDelta / baseline.avgLatency) * 100).toFixed(2))
    : 0;

  const errorDelta = parseFloat((current.errorRate - baseline.errorRate).toFixed(4));

  const p95Delta = current.p95Latency - baseline.p95Latency;

  return {
    latencyDelta,
    latencyPctChange: latencyPct,
    errorRateDelta: errorDelta,
    p95Delta,
    regression:
      latencyPct > 20 || errorDelta > 0.05 || p95Delta > 500,
  };
}

function baselineSummary(baseline, comparison) {
  if (!baseline) return 'No baseline data.';
  let out = `Baseline: count=${baseline.count}, avgLatency=${baseline.avgLatency}ms, p95=${baseline.p95Latency}ms, errorRate=${(baseline.errorRate * 100).toFixed(2)}%`;
  if (comparison) {
    const flag = comparison.regression ? ' ⚠ REGRESSION' : ' ✓ OK';
    out += `\nComparison: latency ${comparison.latencyPctChange > 0 ? '+' : ''}${comparison.latencyPctChange}%, errorRate delta ${comparison.errorRateDelta > 0 ? '+' : ''}${comparison.errorRateDelta}${flag}`;
  }
  return out;
}

module.exports = { computeBaseline, compareToBaseline, baselineSummary, percentile };
