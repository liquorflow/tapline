const { computeBaseline, compareToBaseline, baselineSummary, percentile } = require('./logBaseline');
const { formatBaselineTable, formatBaselineJson, formatBaselineSummary } = require('./baselineFormatter');

const entries = [
  { method: 'GET', status: 200, duration: 100 },
  { method: 'GET', status: 200, duration: 200 },
  { method: 'POST', status: 500, duration: 800 },
  { method: 'GET', status: 404, duration: 50 },
  { method: 'DELETE', status: 204, duration: 120 },
];

describe('computeBaseline', () => {
  test('returns null for empty entries', () => {
    expect(computeBaseline([])).toBeNull();
  });

  test('computes count correctly', () => {
    const b = computeBaseline(entries);
    expect(b.count).toBe(5);
  });

  test('computes avgLatency', () => {
    const b = computeBaseline(entries);
    expect(b.avgLatency).toBe(254); // (100+200+800+50+120)/5 = 254
  });

  test('computes errorRate', () => {
    const b = computeBaseline(entries);
    // status >= 400: 500 and 404 => 2/5 = 0.4
    expect(b.errorRate).toBe(0.4);
  });

  test('computes methodCounts', () => {
    const b = computeBaseline(entries);
    expect(b.methodCounts.GET).toBe(3);
    expect(b.methodCounts.POST).toBe(1);
  });

  test('computes p95 latency', () => {
    const b = computeBaseline(entries);
    expect(typeof b.p95Latency).toBe('number');
  });
});

describe('percentile', () => {
  test('returns 0 for empty array', () => {
    expect(percentile([], 0.95)).toBe(0);
  });

  test('returns max for p1.0', () => {
    expect(percentile([10, 20, 30], 1.0)).toBe(30);
  });
});

describe('compareToBaseline', () => {
  test('returns null if either is null', () => {
    expect(compareToBaseline(null, null)).toBeNull();
  });

  test('detects regression on high latency increase', () => {
    const base = { avgLatency: 100, errorRate: 0.01, p95Latency: 200 };
    const curr = { avgLatency: 130, errorRate: 0.01, p95Latency: 210 };
    const cmp = compareToBaseline(curr, base);
    expect(cmp.regression).toBe(true);
    expect(cmp.latencyPctChange).toBe(30);
  });

  test('no regression for small changes', () => {
    const base = { avgLatency: 100, errorRate: 0.01, p95Latency: 200 };
    const curr = { avgLatency: 105, errorRate: 0.01, p95Latency: 205 };
    const cmp = compareToBaseline(curr, base);
    expect(cmp.regression).toBe(false);
  });
});

describe('baselineSummary', () => {
  test('returns message when no baseline', () => {
    expect(baselineSummary(null)).toBe('No baseline data.');
  });

  test('includes key metrics', () => {
    const b = computeBaseline(entries);
    const s = baselineSummary(b);
    expect(s).toContain('avgLatency');
    expect(s).toContain('errorRate');
  });
});

describe('formatBaselineTable', () => {
  test('returns no-data message when null', () => {
    expect(formatBaselineTable(null)).toContain('No baseline');
  });

  test('formats rows', () => {
    const b = computeBaseline(entries);
    const out = formatBaselineTable(b);
    expect(out).toContain('Avg Latency');
    expect(out).toContain('Error Rate');
  });
});

describe('formatBaselineJson', () => {
  test('returns valid JSON', () => {
    const b = computeBaseline(entries);
    const out = formatBaselineJson(b, null);
    const parsed = JSON.parse(out);
    expect(parsed.baseline.count).toBe(5);
  });
});
