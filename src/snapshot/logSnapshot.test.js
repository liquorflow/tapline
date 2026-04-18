const { hashEntry, takeSnapshot, compareSnapshots, snapshotSummary } = require('./logSnapshot');

const e1 = { method: 'GET', path: '/a', status: 200, latency: 10 };
const e2 = { method: 'POST', path: '/b', status: 201, latency: 20 };
const e3 = { method: 'DELETE', path: '/c', status: 204, latency: 5 };

test('hashEntry returns consistent hash', () => {
  expect(hashEntry(e1)).toBe(hashEntry({ ...e1 }));
});

test('hashEntry differs for different entries', () => {
  expect(hashEntry(e1)).not.toBe(hashEntry(e2));
});

test('takeSnapshot captures count and label', () => {
  const snap = takeSnapshot([e1, e2], 'test');
  expect(snap.label).toBe('test');
  expect(snap.count).toBe(2);
  expect(snap.hashes).toHaveLength(2);
  expect(snap.entries).toHaveLength(2);
});

test('takeSnapshot entries are copies', () => {
  const entries = [e1];
  const snap = takeSnapshot(entries, 'x');
  entries[0].method = 'PATCH';
  expect(snap.entries[0].method).toBe('GET');
});

test('compareSnapshots detects added entries', () => {
  const a = takeSnapshot([e1, e2], 'a');
  const b = takeSnapshot([e1, e2, e3], 'b');
  const diff = compareSnapshots(a, b);
  expect(diff.added).toBe(1);
  expect(diff.removed).toBe(0);
  expect(diff.retained).toBe(2);
});

test('compareSnapshots detects removed entries', () => {
  const a = takeSnapshot([e1, e2, e3], 'a');
  const b = takeSnapshot([e1], 'b');
  const diff = compareSnapshots(a, b);
  expect(diff.removed).toBe(2);
  expect(diff.added).toBe(0);
});

test('snapshotSummary includes label and count', () => {
  const snap = takeSnapshot([e1], 'mysnap');
  const summary = snapshotSummary(snap);
  expect(summary).toContain('mysnap');
  expect(summary).toContain('1 entries');
});
