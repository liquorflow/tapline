const { profileByPath, profileByMethod, topSlowPaths, summarizeProfile } = require('./logProfiler');

const entries = [
  { method: 'GET', path: '/api/users', status: 200, latency: 120 },
  { method: 'GET', path: '/api/users', status: 500, latency: 300 },
  { method: 'POST', path: '/api/orders', status: 201, latency: 80 },
  { method: 'GET', path: '/api/items', status: 200, latency: 50 },
  { method: 'DELETE', path: '/api/orders', status: 404, latency: 200 }
];

test('profileByPath groups by path', () => {
  const result = profileByPath(entries);
  const users = result.find(p => p.path === '/api/users');
  expect(users.count).toBe(2);
  expect(users.avgLatency).toBe(210);
  expect(users.errorRate).toBe(0.5);
});

test('profileByMethod groups by method', () => {
  const result = profileByMethod(entries);
  const get = result.find(p => p.method === 'GET');
  expect(get.count).toBe(3);
});

test('topSlowPaths returns sorted by avgLatency', () => {
  const result = topSlowPaths(entries, 2);
  expect(result.length).toBe(2);
  expect(result[0].avgLatency).toBeGreaterThanOrEqual(result[1].avgLatency);
});

test('summarizeProfile returns full summary', () => {
  const s = summarizeProfile(entries);
  expect(s.total).toBe(5);
  expect(s.avgLatency).toBeGreaterThan(0);
  expect(s.errorRate).toBeCloseTo(0.4);
  expect(Array.isArray(s.byMethod)).toBe(true);
  expect(Array.isArray(s.topSlowPaths)).toBe(true);
});

test('handles empty entries', () => {
  const s = summarizeProfile([]);
  expect(s.total).toBe(0);
  expect(s.avgLatency).toBe(0);
});
