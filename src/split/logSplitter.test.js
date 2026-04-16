const { chunkEntries, partitionEntries, splitByField, splitAt, splitEntries } = require('./logSplitter');

const entries = [
  { method: 'GET', status: 200, path: '/a', latency: 10 },
  { method: 'POST', status: 201, path: '/b', latency: 20 },
  { method: 'GET', status: 404, path: '/c', latency: 30 },
  { method: 'DELETE', status: 200, path: '/d', latency: 40 },
  { method: 'GET', status: 500, path: '/e', latency: 50 },
];

test('chunkEntries splits into correct chunk sizes', () => {
  const chunks = chunkEntries(entries, 2);
  expect(chunks.length).toBe(3);
  expect(chunks[0].length).toBe(2);
  expect(chunks[2].length).toBe(1);
});

test('chunkEntries throws on invalid size', () => {
  expect(() => chunkEntries(entries, 0)).toThrow();
});

test('partitionEntries splits into n partitions', () => {
  const parts = partitionEntries(entries, 2);
  expect(parts.length).toBe(2);
  const total = parts.reduce((s, p) => s + p.length, 0);
  expect(total).toBe(entries.length);
});

test('partitionEntries throws on invalid n', () => {
  expect(() => partitionEntries(entries, 0)).toThrow();
});

test('splitByField groups by method', () => {
  const result = splitByField(entries, 'method');
  expect(result['GET'].length).toBe(3);
  expect(result['POST'].length).toBe(1);
  expect(result['DELETE'].length).toBe(1);
});

test('splitByField groups by status', () => {
  const result = splitByField(entries, 'status');
  expect(result['200'].length).toBe(2);
});

test('splitAt returns correct halves', () => {
  const [before, after] = splitAt(entries, 3);
  expect(before.length).toBe(3);
  expect(after.length).toBe(2);
});

test('splitEntries chunk mode', () => {
  const result = splitEntries(entries, { mode: 'chunk', size: 2 });
  expect(Array.isArray(result)).toBe(true);
  expect(result[0].length).toBe(2);
});

test('splitEntries field mode', () => {
  const result = splitEntries(entries, { mode: 'field', field: 'method' });
  expect(result['GET']).toBeDefined();
});

test('splitEntries throws on unknown mode', () => {
  expect(() => splitEntries(entries, { mode: 'bogus' })).toThrow();
});
