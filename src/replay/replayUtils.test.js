const { sleep, summarizeResults, formatSummary } = require('./replayUtils');

describe('sleep', () => {
  test('resolves after approximately the given ms', async () => {
    const start = Date.now();
    await sleep(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
  });
});

describe('summarizeResults', () => {
  const results = [
    { success: true, status: 200, latency: 100 },
    { success: true, status: 200, latency: 200 },
    { success: false, status: 500, latency: 50 },
    { success: false, status: null, latency: 10 },
  ];

  test('counts total, succeeded, failed', () => {
    const s = summarizeResults(results);
    expect(s.total).toBe(4);
    expect(s.succeeded).toBe(2);
    expect(s.failed).toBe(2);
  });

  test('counts status codes', () => {
    const s = summarizeResults(results);
    expect(s.statusCounts[200]).toBe(2);
    expect(s.statusCounts[500]).toBe(1);
    expect(s.statusCounts['error']).toBe(1);
  });

  test('computes average latency', () => {
    const s = summarizeResults(results);
    expect(s.avgLatency).toBe(Math.round((100 + 200 + 50 + 10) / 4));
  });

  test('handles empty results', () => {
    const s = summarizeResults([]);
    expect(s.total).toBe(0);
    expect(s.avgLatency).toBeNull();
  });
});

describe('formatSummary', () => {
  test('includes key metrics in output string', () => {
    const summary = { total: 3, succeeded: 2, failed: 1, statusCounts: { 200: 2, 404: 1 }, avgLatency: 120 };
    const out = formatSummary(summary);
    expect(out).toContain('Total: 3');
    expect(out).toContain('Succeeded: 2');
    expect(out).toContain('Failed: 1');
    expect(out).toContain('120ms');
    expect(out).toContain('200(2)');
  });
});
