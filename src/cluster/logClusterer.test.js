const { normalizePath, clusterByPathPattern, clusterByMethodAndPath, clusterByStatusRange, summarizeClusters, clusterEntries } = require('./logClusterer');

const entries = [
  { method: 'GET', path: '/users/123', status: 200, duration: 50 },
  { method: 'GET', path: '/users/456', status: 200, duration: 80 },
  { method: 'POST', path: '/users', status: 201, duration: 120 },
  { method: 'GET', path: '/orders/abc-def-1234', status: 404, duration: 30 },
  { method: 'DELETE', path: '/users/789', status: 500, duration: 200 },
];

test('normalizePath replaces numeric ids', () => {
  expect(normalizePath('/users/123')).toBe('/:id');
});

test('normalizePath replaces uuid-like segments', () => {
  const result = normalizePath('/orders/abc-def-1234');
  expect(result).toMatch('/:id');
});

test('clusterByPathPattern groups /users/123 and /users/456 together', () => {
  const clusters = clusterByPathPattern(entries);
  const key = '/:id';
  expect(clusters[key]).toBeDefined();
  expect(clusters[key].length).toBeGreaterThanOrEqual(2);
});

test('clusterByMethodAndPath separates GET and POST', () => {
  const clusters = clusterByMethodAndPath(entries);
  expect(clusters['POST /users']).toBeDefined();
  expect(clusters['POST /users'].length).toBe(1);
});

test('clusterByStatusRange buckets correctly', () => {
  const clusters = clusterByStatusRange(entries);
  expect(clusters['2xx'].length).toBe(3);
  expect(clusters['4xx'].length).toBe(1);
  expect(clusters['5xx'].length).toBe(1);
});

test('summarizeClusters returns count and avgLatency', () => {
  const clusters = clusterByStatusRange(entries);
  const summary = summarizeClusters(clusters);
  const twoxx = summary.find(s => s.key === '2xx');
  expect(twoxx.count).toBe(3);
  expect(twoxx.avgLatency).toBe(83);
});

test('clusterEntries defaults to path clustering', () => {
  const result = clusterEntries(entries);
  expect(typeof result).toBe('object');
});

test('clusterEntries by status', () => {
  const result = clusterEntries(entries, 'status');
  expect(result['5xx'].length).toBe(1);
});

test('clusterEntries by method', () => {
  const result = clusterEntries(entries, 'method');
  expect(result['DELETE /:id']).toBeDefined();
});
