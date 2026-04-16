const { formatAggregateTable, formatAggregateJson, formatAggregateSummary } = require('./aggregateFormatter');

const rows = [
  { key: 'GET', count: 10, avgLatency: 120, statuses: { '200': 8, '404': 2 } },
  { key: 'POST', count: 4, avgLatency: 300, statuses: { '201': 4 } },
];

test('formatAggregateTable returns header and rows', () => {
  const out = formatAggregateTable(rows);
  expect(out).toContain('Key');
  expect(out).toContain('GET');
  expect(out).toContain('POST');
});

test('formatAggregateTable includes status map', () => {
  const out = formatAggregateTable(rows);
  expect(out).toContain('200:8');
});

test('formatAggregateTable handles empty rows', () => {
  expect(formatAggregateTable([])).toBe('No data.');
});

test('formatAggregateJson returns valid JSON', () => {
  const out = formatAggregateJson(rows);
  const parsed = JSON.parse(out);
  expect(parsed).toHaveLength(2);
  expect(parsed[0].key).toBe('GET');
});

test('formatAggregateSummary shows total and top key', () => {
  const out = formatAggregateSummary(rows);
  expect(out).toContain('Total entries: 14');
  expect(out).toContain('Top key: GET');
});
