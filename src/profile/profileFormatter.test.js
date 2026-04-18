const { formatProfileTable, formatProfileJson, formatProfileSummary } = require('./profileFormatter');
const { summarizeProfile, profileByPath } = require('./logProfiler');

const entries = [
  { method: 'GET', path: '/api/users', status: 200, latency: 100 },
  { method: 'POST', path: '/api/orders', status: 500, latency: 400 },
  { method: 'GET', path: '/api/users', status: 200, latency: 200 }
];

test('formatProfileTable includes path and stats', () => {
  const profiles = profileByPath(entries);
  const out = formatProfileTable(profiles, 'path');
  expect(out).toContain('/api/users');
  expect(out).toContain('avgLatency=');
  expect(out).toContain('errorRate=');
});

test('formatProfileJson is valid JSON', () => {
  const summary = summarizeProfile(entries);
  const out = formatProfileJson(summary);
  expect(() => JSON.parse(out)).not.toThrow();
  const parsed = JSON.parse(out);
  expect(parsed.total).toBe(3);
});

test('formatProfileSummary contains key lines', () => {
  const summary = summarizeProfile(entries);
  const out = formatProfileSummary(summary);
  expect(out).toContain('Total requests');
  expect(out).toContain('Avg latency');
  expect(out).toContain('Top slow paths');
});
