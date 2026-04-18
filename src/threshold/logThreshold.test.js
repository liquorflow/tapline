const {
  exceedsLatency,
  exceedsErrorRate,
  flagByLatency,
  flagByStatus,
  summarizeThresholds,
  applyThresholds
} = require('./logThreshold');

const entries = [
  { method: 'GET', path: '/a', status: 200, duration: 120 },
  { method: 'POST', path: '/b', status: 500, duration: 300 },
  { method: 'GET', path: '/c', status: 404, duration: 50 },
  { method: 'GET', path: '/d', status: 200, duration: 800 }
];

test('exceedsLatency returns true when duration over threshold', () => {
  expect(exceedsLatency(entries[3], 500)).toBe(true);
  expect(exceedsLatency(entries[0], 500)).toBe(false);
});

test('exceedsErrorRate detects high 5xx rate', () => {
  expect(exceedsErrorRate(entries, 0.1)).toBe(true);
  expect(exceedsErrorRate(entries, 0.5)).toBe(false);
});

test('exceedsErrorRate returns false for empty entries', () => {
  expect(exceedsErrorRate([], 0.1)).toBe(false);
});

test('flagByLatency adds high-latency flag', () => {
  const result = flagByLatency(entries, 200);
  expect(result[1].flags).toContain('high-latency');
  expect(result[3].flags).toContain('high-latency');
  expect(result[0].flags).not.toContain('high-latency');
});

test('flagByStatus adds bad-status flag', () => {
  const result = flagByStatus(entries, 400);
  expect(result[1].flags).toContain('bad-status');
  expect(result[2].flags).toContain('bad-status');
  expect(result[0].flags).not.toContain('bad-status');
});

test('summarizeThresholds counts flagged entries', () => {
  const flagged = flagByLatency(entries, 200);
  const summary = summarizeThresholds(flagged);
  expect(summary.flagged).toBe(2);
  expect(summary.byFlag['high-latency']).toBe(2);
});

test('applyThresholds applies both latency and status flags', () => {
  const result = applyThresholds(entries, { maxLatency: 200, minStatus: 400 });
  const summary = summarizeThresholds(result);
  expect(summary.flagged).toBeGreaterThan(0);
  expect(summary.byFlag['high-latency']).toBeDefined();
  expect(summary.byFlag['bad-status']).toBeDefined();
});
