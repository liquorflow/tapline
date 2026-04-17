const { matchesRule, routeEntries, summarizeRoutes } = require('./logRouter');

const entries = [
  { method: 'GET',  path: '/api/users',  status: 200, latency: 50 },
  { method: 'POST', path: '/api/orders', status: 201, latency: 120 },
  { method: 'GET',  path: '/health',     status: 200, latency: 5 },
  { method: 'DELETE', path: '/api/items', status: 404, latency: 30 },
  { method: 'GET',  path: '/api/data',   status: 500, latency: 800 },
];

describe('matchesRule', () => {
  test('matches string field value', () => {
    expect(matchesRule(entries[0], { field: 'method', match: 'GET', bucket: 'gets' })).toBe(true);
  });

  test('does not match wrong value', () => {
    expect(matchesRule(entries[1], { field: 'method', match: 'GET', bucket: 'gets' })).toBe(false);
  });

  test('matches regex', () => {
    expect(matchesRule(entries[0], { field: 'path', match: /^\/api/, bucket: 'api' })).toBe(true);
  });

  test('regex does not match unrelated path', () => {
    expect(matchesRule(entries[2], { field: 'path', match: /^\/api/, bucket: 'api' })).toBe(false);
  });
});

describe('routeEntries', () => {
  const rules = [
    { field: 'status', match: '500', bucket: 'errors' },
    { field: 'path',   match: /^\/health/, bucket: 'health' },
    { field: 'method', match: 'POST', bucket: 'writes' },
  ];

  test('routes entries into correct buckets', () => {
    const buckets = routeEntries(entries, rules);
    expect(buckets.errors).toHaveLength(1);
    expect(buckets.health).toHaveLength(1);
    expect(buckets.writes).toHaveLength(1);
    expect(buckets.default).toHaveLength(2);
  });

  test('first matching rule wins', () => {
    const e = [{ method: 'POST', path: '/health', status: 200, latency: 10 }];
    const r = [
      { field: 'path',   match: /\/health/, bucket: 'health' },
      { field: 'method', match: 'POST',     bucket: 'writes' },
    ];
    const buckets = routeEntries(e, r);
    expect(buckets.health).toHaveLength(1);
    expect(buckets.writes).toHaveLength(0);
  });

  test('unmatched entries go to default', () => {
    const buckets = routeEntries(entries, []);
    expect(buckets.default).toHaveLength(entries.length);
  });
});

describe('summarizeRoutes', () => {
  test('returns counts per bucket', () => {
    const buckets = { errors: [1, 2], health: [3], default: [] };
    expect(summarizeRoutes(buckets)).toEqual({ errors: 2, health: 1, default: 0 });
  });
});
