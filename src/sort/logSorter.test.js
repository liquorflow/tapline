const { sortByTime, sortByLatency, sortByStatus, sortByPath, sortEntries } = require('./logSorter');

const entries = [
  { timestamp: '2024-01-01T10:00:00Z', duration: 200, status: 404, path: '/zebra' },
  { timestamp: '2024-01-01T08:00:00Z', duration: 50,  status: 200, path: '/alpha' },
  { timestamp: '2024-01-01T09:00:00Z', duration: 800, status: 500, path: '/middle' },
];

test('sortByTime ascending', () => {
  const result = sortByTime(entries);
  expect(result[0].path).toBe('/alpha');
  expect(result[2].path).toBe('/zebra');
});

test('sortByTime descending', () => {
  const result = sortByTime(entries, true);
  expect(result[0].path).toBe('/zebra');
});

test('sortByLatency ascending', () => {
  const result = sortByLatency(entries);
  expect(result[0].duration).toBe(50);
  expect(result[2].duration).toBe(800);
});

test('sortByLatency descending', () => {
  const result = sortByLatency(entries, true);
  expect(result[0].duration).toBe(800);
});

test('sortByStatus ascending', () => {
  const result = sortByStatus(entries);
  expect(result[0].status).toBe(200);
  expect(result[2].status).toBe(500);
});

test('sortByPath alphabetical', () => {
  const result = sortByPath(entries);
  expect(result[0].path).toBe('/alpha');
  expect(result[2].path).toBe('/zebra');
});

test('sortByPath descending', () => {
  const result = sortByPath(entries, true);
  expect(result[0].path).toBe('/zebra');
});

test('sortEntries dispatches to latency', () => {
  const result = sortEntries(entries, 'latency');
  expect(result[0].duration).toBe(50);
});

test('sortEntries defaults to time', () => {
  const result = sortEntries(entries);
  expect(result[0].timestamp).toBe('2024-01-01T08:00:00Z');
});

test('does not mutate original array', () => {
  const original = [...entries];
  sortByTime(entries);
  expect(entries[0].path).toBe(original[0].path);
});
