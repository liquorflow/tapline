const { groupBy, groupByLatency, summarizeGroups, groupEntries } = require('./logGrouper');

const entries = [
  { method: 'GET', status: 200, path: '/a', duration: 100 },
  { method: 'POST', status: 201, path: '/b', duration: 500 },
  { method: 'GET', status: 404, path: '/c', duration: 1500 },
  { method: 'DELETE', status: 200, path: '/a', duration: 50 },
  { method: 'GET', status: 200, path: '/a', duration: 800 },
];

describe('groupBy', () => {
  test('groups by method', () => {
    const g = groupBy(entries, 'method');
    expect(g['GET']).toHaveLength(3);
    expect(g['POST']).toHaveLength(1);
    expect(g['DELETE']).toHaveLength(1);
  });

  test('groups by status', () => {
    const g = groupBy(entries, 'status');
    expect(g[200]).toHaveLength(2);
    expect(g[201]).toHaveLength(1);
    expect(g[404]).toHaveLength(1);
  });

  test('unknown field uses __unknown__ key', () => {
    const g = groupBy([{ method: 'GET' }], 'missing');
    expect(g['__unknown__']).toHaveLength(1);
  });
});

describe('groupByLatency', () => {
  test('splits into fast/medium/slow', () => {
    const g = groupByLatency(entries);
    expect(g.fast).toHaveLength(2);   // 100, 50
    expect(g.medium).toHaveLength(2); // 500, 800
    expect(g.slow).toHaveLength(1);   // 1500
  });

  test('custom thresholds', () => {
    const g = groupByLatency(entries, { fast: 60, medium: 600 });
    expect(g.fast).toHaveLength(1);   // 50
    expect(g.medium).toHaveLength(3); // 100, 500, 800 — wait, 100>60 so medium
    expect(g.slow).toHaveLength(1);
  });
});

describe('summarizeGroups', () => {
  test('returns counts per key', () => {
    const g = groupBy(entries, 'method');
    const s = summarizeGroups(g);
    expect(s).toEqual({ GET: 3, POST: 1, DELETE: 1 });
  });
});

describe('groupEntries', () => {
  test('delegates to groupBy for method', () => {
    const g = groupEntries(entries, 'method');
    expect(Object.keys(g)).toContain('GET');
  });

  test('delegates to groupByLatency for latency', () => {
    const g = groupEntries(entries, 'latency');
    expect(g).toHaveProperty('fast');
    expect(g).toHaveProperty('slow');
  });
});
