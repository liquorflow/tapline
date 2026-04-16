const {
  truncateHead,
  truncateTail,
  truncateByLatency,
  truncateByTimeWindow,
  truncateEntries,
} = require('./logTruncator');

const entries = [
  { method: 'GET',  path: '/a', status: 200, duration: 50,  timestamp: '2024-01-01T00:00:01Z' },
  { method: 'POST', path: '/b', status: 201, duration: 200, timestamp: '2024-01-01T00:00:02Z' },
  { method: 'GET',  path: '/c', status: 404, duration: 30,  timestamp: '2024-01-01T00:00:03Z' },
  { method: 'DELETE', path: '/d', status: 500, duration: 800, timestamp: '2024-01-01T00:00:04Z' },
];

describe('truncateHead', () => {
  test('returns first n entries', () => {
    expect(truncateHead(entries, 2)).toHaveLength(2);
    expect(truncateHead(entries, 2)[0].path).toBe('/a');
  });
  test('n=0 returns empty', () => expect(truncateHead(entries, 0)).toEqual([]));
  test('n > length returns all', () => expect(truncateHead(entries, 99)).toHaveLength(4));
  test('throws on invalid n', () => expect(() => truncateHead(entries, -1)).toThrow());
});

describe('truncateTail', () => {
  test('returns last n entries', () => {
    const result = truncateTail(entries, 2);
    expect(result).toHaveLength(2);
    expect(result[1].path).toBe('/d');
  });
  test('n=0 returns empty', () => expect(truncateTail(entries, 0)).toEqual([]));
  test('throws on invalid n', () => expect(() => truncateTail(entries, -3)).toThrow());
});

describe('truncateByLatency', () => {
  test('filters entries above maxMs', () => {
    const result = truncateByLatency(entries, 100);
    expect(result).toHaveLength(2);
    expect(result.every(e => e.duration <= 100)).toBe(true);
  });
  test('returns all when maxMs is large', () => {
    expect(truncateByLatency(entries, 9999)).toHaveLength(4);
  });
  test('skips entries without duration', () => {
    const mixed = [...entries, { path: '/e', status: 200 }];
    expect(truncateByLatency(mixed, 100)).toHaveLength(2);
  });
});

describe('truncateByTimeWindow', () => {
  const start = new Date('2024-01-01T00:00:02Z').getTime();
  const end   = new Date('2024-01-01T00:00:03Z').getTime();
  test('returns entries within window', () => {
    const result = truncateByTimeWindow(entries, start, end);
    expect(result).toHaveLength(2);
    expect(result.map(e => e.path)).toEqual(['/b', '/c']);
  });
  test('empty result when window excludes all', () => {
    expect(truncateByTimeWindow(entries, 0, 1)).toHaveLength(0);
  });
});

describe('truncateEntries', () => {
  test('dispatches head strategy', () => {
    expect(truncateEntries(entries, { strategy: 'head', n: 1 })).toHaveLength(1);
  });
  test('dispatches tail strategy', () => {
    expect(truncateEntries(entries, { strategy: 'tail', n: 1 })[0].path).toBe('/d');
  });
  test('dispatches latency strategy', () => {
    expect(truncateEntries(entries, { strategy: 'latency', maxMs: 50 })).toHaveLength(2);
  });
  test('throws on unknown strategy', () => {
    expect(() => truncateEntries(entries, { strategy: 'bogus' })).toThrow();
  });
});
