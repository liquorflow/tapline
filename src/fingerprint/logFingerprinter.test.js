const { normalizePath, fingerprintEntry, fingerprintEntries, groupByFingerprint, summarizeFingerprints } = require('./logFingerprinter');

const entries = [
  { method: 'GET', path: '/users/123', status: 200, duration: 50 },
  { method: 'GET', path: '/users/456', status: 200, duration: 80 },
  { method: 'POST', path: '/orders', status: 201, duration: 120 },
  { method: 'GET', path: '/users/789', status: 404, duration: 30 },
];

test('normalizePath replaces numeric ids', () => {
  expect(normalizePath('/users/123')).toBe('/users/:n');
  expect(normalizePath('/items/abc123def456')).toBe('/items/:id');
  expect(normalizePath('/orders')).toBe('/orders');
});

test('fingerprintEntry adds fingerprint and normalizedPath', () => {
  const result = fingerprintEntry(entries[0]);
  expect(result.fingerprint).toBeDefined();
  expect(result.fingerprint).toHaveLength(8);
  expect(result.normalizedPath).toBe('/users/:n');
});

test('same pattern produces same fingerprint', () => {
  const a = fingerprintEntry(entries[0]);
  const b = fingerprintEntry(entries[1]);
  expect(a.fingerprint).toBe(b.fingerprint);
});

test('different status produces different fingerprint', () => {
  const a = fingerprintEntry(entries[1]);
  const b = fingerprintEntry(entries[3]);
  expect(a.fingerprint).not.toBe(b.fingerprint);
});

test('fingerprintEntries processes all entries', () => {
  const results = fingerprintEntries(entries);
  expect(results).toHaveLength(4);
  results.forEach(r => expect(r.fingerprint).toBeDefined());
});

test('groupByFingerprint groups matching entries', () => {
  const groups = groupByFingerprint(entries);
  const keys = Object.keys(groups);
  expect(keys.length).toBe(3);
  const bigGroup = Object.values(groups).find(g => g.length === 2);
  expect(bigGroup).toBeDefined();
});

test('summarizeFingerprints returns summary per pattern', () => {
  const summary = summarizeFingerprints(entries);
  expect(summary.length).toBe(3);
  const userOk = summary.find(s => s.normalizedPath === '/users/:n' && s.status === 200);
  expect(userOk).toBeDefined();
  expect(userOk.count).toBe(2);
  expect(userOk.avgLatency).toBe(65);
});
