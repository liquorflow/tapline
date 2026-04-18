const {
  mean, stddev, detectLatencyOutliers, detectStatusOutliers,
  summarizeOutliers, detectOutliers
} = require('./logOutlier');
const { formatOutlierTable, formatOutlierSummary } = require('./outlierFormatter');

const base = (overrides = {}) => ({
  method: 'GET', path: '/api/test', status: 200, duration: 100, ...overrides
});

const entries = [
  ...Array(20).fill(null).map((_, i) => base({ duration: 100 + i })),
  base({ duration: 9000, path: '/slow' }),
];

test('mean calculates correctly', () => {
  expect(mean([1, 2, 3])).toBeCloseTo(2);
  expect(mean([])).toBe(0);
});

test('stddev calculates correctly', () => {
  const avg = mean([2, 4, 4, 4, 5, 5, 7, 9]);
  expect(stddev([2, 4, 4, 4, 5, 5, 7, 9], avg)).toBeCloseTo(2, 0);
});

test('detectLatencyOutliers finds slow entry', () => {
  const outliers = detectLatencyOutliers(entries);
  expect(outliers.length).toBeGreaterThanOrEqual(1);
  expect(outliers.some(e => e.path === '/slow')).toBe(true);
});

test('detectStatusOutliers finds rare statuses', () => {
  const mixed = [
    ...Array(50).fill(null).map(() => base({ status: 200 })),
    base({ status: 418 }),
  ];
  const outliers = detectStatusOutliers(mixed);
  expect(outliers.every(e => e.status === 418)).toBe(true);
});

test('summarizeOutliers returns correct shape', () => {
  const outliers = [base({ duration: 9000, path: '/slow' })];
  const s = summarizeOutliers(outliers);
  expect(s.count).toBe(1);
  expect(s.maxLatency).toBe(9000);
});

test('detectOutliers default options', () => {
  const result = detectOutliers(entries);
  expect(Array.isArray(result)).toBe(true);
});

test('formatOutlierTable renders rows', () => {
  const out = formatOutlierTable([base({ duration: 9000 })]);
  expect(out).toContain('GET');
  expect(out).toContain('9000');
});

test('formatOutlierTable empty', () => {
  expect(formatOutlierTable([])).toContain('No outliers');
});

test('formatOutlierSummary shows count', () => {
  const out = formatOutlierSummary([base({ duration: 9000 })]);
  expect(out).toContain('Outliers: 1');
});
