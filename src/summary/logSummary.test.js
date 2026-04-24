'use strict';

const { buildSummary, oneLiner } = require('./logSummary');

const makeEntry = (method, status, duration, timestamp = '2024-01-01T00:00:00Z') => ({
  method, status, duration, timestamp, path: '/api/test',
});

describe('buildSummary', () => {
  test('returns zero summary for empty entries', () => {
    const s = buildSummary([]);
    expect(s.total).toBe(0);
    expect(s.latency).toBeNull();
    expect(s.budgetBreaches).toEqual([]);
  });

  test('counts total entries', () => {
    const entries = [makeEntry('GET', 200, 100), makeEntry('POST', 201, 200)];
    const s = buildSummary(entries);
    expect(s.total).toBe(2);
  });

  test('computes error rate', () => {
    const entries = [
      makeEntry('GET', 200, 50),
      makeEntry('GET', 500, 300),
      makeEntry('GET', 500, 400),
    ];
    const s = buildSummary(entries);
    expect(s.errorRate).toBeCloseTo(0.6667, 3);
  });

  test('includes method counts', () => {
    const entries = [makeEntry('GET', 200, 100), makeEntry('GET', 200, 120), makeEntry('POST', 201, 80)];
    const s = buildSummary(entries);
    expect(s.methods['GET']).toBe(2);
    expect(s.methods['POST']).toBe(1);
  });

  test('includes status counts', () => {
    const entries = [makeEntry('GET', 200, 100), makeEntry('GET', 404, 50)];
    const s = buildSummary(entries);
    expect(s.statuses[200]).toBe(1);
    expect(s.statuses[404]).toBe(1);
  });

  test('includes latency stats', () => {
    const entries = [makeEntry('GET', 200, 100), makeEntry('GET', 200, 200), makeEntry('GET', 200, 300)];
    const s = buildSummary(entries);
    expect(s.latency).not.toBeNull();
    expect(s.latency.min).toBe(100);
    expect(s.latency.max).toBe(300);
  });

  test('outlierCount is a number', () => {
    const entries = Array.from({ length: 10 }, (_, i) => makeEntry('GET', 200, (i + 1) * 50));
    const s = buildSummary(entries);
    expect(typeof s.outlierCount).toBe('number');
  });
});

describe('oneLiner', () => {
  test('returns no-entries string for empty summary', () => {
    const s = buildSummary([]);
    expect(oneLiner(s)).toBe('No entries.');
  });

  test('returns a non-empty string for real data', () => {
    const entries = [makeEntry('GET', 200, 150), makeEntry('POST', 500, 900)];
    const s = buildSummary(entries);
    const line = oneLiner(s);
    expect(line).toContain('requests');
    expect(line).toContain('errors=');
  });
});
