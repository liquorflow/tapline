const { rankByLatency, rankByErrorRate, rankByFrequency, rankEntries } = require('./logRanker');

const entries = [
  { path: '/a', method: 'GET', status: 200, duration: 120 },
  { path: '/b', method: 'POST', status: 500, duration: 300 },
  { path: '/a', method: 'GET', status: 404, duration: 80 },
  { path: '/c', method: 'GET', status: 200, duration: 50 },
  { path: '/b', method: 'POST', status: 200, duration: 200 },
];

test('rankByLatency returns entries sorted by duration desc with rank', () => {
  const ranked = rankByLatency(entries);
  expect(ranked[0].rank).toBe(1);
  expect(ranked[0].duration).toBe(300);
  expect(ranked[ranked.length - 1].duration).toBe(50);
});

test('rankByLatency does not mutate original', () => {
  const copy = [...entries];
  rankByLatency(entries);
  expect(entries).toEqual(copy);
});

test('rankByErrorRate groups by path and computes error rate', () => {
  const ranked = rankByErrorRate(entries);
  const b = ranked.find(r => r.path === '/b');
  expect(b).toBeDefined();
  expect(b.errorRate).toBeCloseTo(0.5);
  expect(ranked[0].rank).toBe(1);
});

test('rankByFrequency counts and ranks paths', () => {
  const ranked = rankByFrequency(entries);
  expect(ranked[0].path).toBe('/a');
  expect(ranked[0].count).toBe(2);
  expect(ranked[0].rank).toBe(1);
});

test('rankEntries dispatches by field', () => {
  expect(rankEntries(entries, 'latency')[0].duration).toBe(300);
  expect(rankEntries(entries, 'frequency')[0].path).toBe('/a');
  expect(rankEntries(entries, 'errorRate')[0].rank).toBe(1);
});

test('rankEntries throws on unknown field', () => {
  expect(() => rankEntries(entries, 'bogus')).toThrow('Unknown ranking field: bogus');
});
