const { aggregateByMethod, aggregateByPath, aggregateByStatus, aggregateEntries } = require('./logAggregator');

const entries = [
  { method: 'GET', path: '/api/users', status: 200, duration: 100 },
  { method: 'GET', path: '/api/users', status: 200, duration: 200 },
  { method: 'POST', path: '/api/users', status: 201, duration: 300 },
  { method: 'GET', path: '/api/items', status: 404, duration: 50 },
  { method: 'DELETE', path: '/api/items', status: 500, duration: 80 },
];

test('aggregateByMethod counts correctly', () => {
  const rows = aggregateByMethod(entries);
  const get = rows.find(r => r.key === 'GET');
  expect(get.count).toBe(3);
  expect(get.avgLatency).toBe(116);
});

test('aggregateByMethod includes all methods', () => {
  const rows = aggregateByMethod(entries);
  const keys = rows.map(r => r.key);
  expect(keys).toContain('POST');
  expect(keys).toContain('DELETE');
});

test('aggregateByPath groups paths', () => {
  const rows = aggregateByPath(entries);
  const users = rows.find(r => r.key === '/api/users');
  expect(users.count).toBe(3);
});

test('aggregateByStatus groups statuses', () => {
  const rows = aggregateByStatus(entries);
  const ok = rows.find(r => r.key === 200);
  expect(ok.count).toBe(2);
});

test('aggregateEntries with custom field', () => {
  const rows = aggregateEntries(entries, 'method');
  expect(rows.length).toBeGreaterThan(0);
});

test('handles missing field gracefully', () => {
  const rows = aggregateEntries(entries, 'nonexistent');
  expect(rows[0].key).toBe('__unknown__');
  expect(rows[0].count).toBe(5);
});

test('statuses map is populated', () => {
  const rows = aggregateByMethod(entries);
  const get = rows.find(r => r.key === 'GET');
  expect(get.statuses['200']).toBe(2);
  expect(get.statuses['404']).toBe(1);
});
