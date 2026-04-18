const { LogChain } = require('./logChainer');

const entries = [
  { method: 'GET', path: '/a', status: 200, latency: 50 },
  { method: 'POST', path: '/b', status: 201, latency: 120 },
  { method: 'GET', path: '/c', status: 404, latency: 30 },
  { method: 'DELETE', path: '/a', status: 500, latency: 200 },
  { method: 'GET', path: '/a', status: 200, latency: 50 },
];

test('filter reduces entries', () => {
  const result = LogChain.from(entries).filter(e => e.method === 'GET').toArray();
  expect(result).toHaveLength(3);
});

test('map transforms entries', () => {
  const result = LogChain.from(entries).map(e => ({ ...e, tagged: true })).toArray();
  expect(result.every(e => e.tagged)).toBe(true);
});

test('limit caps results', () => {
  expect(LogChain.from(entries).limit(2).count()).toBe(2);
});

test('skip removes leading entries', () => {
  expect(LogChain.from(entries).skip(3).count()).toBe(2);
});

test('sort orders entries', () => {
  const result = LogChain.from(entries).sort((a, b) => a.latency - b.latency).toArray();
  expect(result[0].latency).toBe(30);
  expect(result[result.length - 1].latency).toBe(200);
});

test('unique deduplicates by key', () => {
  const result = LogChain.from(entries).unique(e => e.path + e.status).toArray();
  expect(result).toHaveLength(4);
});

test('tap does not mutate chain', () => {
  const seen = [];
  const result = LogChain.from(entries).tap(e => seen.push(e.method)).toArray();
  expect(seen).toHaveLength(5);
  expect(result).toHaveLength(5);
});

test('groupBy returns grouped object', () => {
  const groups = LogChain.from(entries).groupBy(e => e.method);
  expect(groups['GET']).toHaveLength(3);
  expect(groups['POST']).toHaveLength(1);
});

test('first and last return correct entries', () => {
  const chain = LogChain.from(entries);
  expect(chain.first().path).toBe('/a');
  expect(chain.last().latency).toBe(50);
});

test('chaining multiple ops works', () => {
  const result = LogChain.from(entries)
    .filter(e => e.status < 400)
    .sort((a, b) => a.latency - b.latency)
    .limit(2)
    .toArray();
  expect(result).toHaveLength(2);
  expect(result[0].latency).toBeLessThanOrEqual(result[1].latency);
});
