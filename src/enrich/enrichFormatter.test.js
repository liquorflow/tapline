const {
  formatDurationClass,
  formatEnrichedEntry,
  formatEnrichedTable,
  formatEnrichedJson
} = require('./enrichFormatter');

const entry = {
  requestId: 'req-1',
  method: 'GET',
  path: '/health',
  status: 200,
  latency: 80,
  durationClass: 'fast',
  host: 'localhost',
  weekday: 'Fri',
  hour: 10
};

test('formatDurationClass includes class name', () => {
  expect(formatDurationClass('fast')).toContain('fast');
  expect(formatDurationClass('slow')).toContain('slow');
});

test('formatDurationClass returns empty for missing', () => {
  expect(formatDurationClass(undefined)).toBe('');
});

test('formatEnrichedEntry includes key fields', () => {
  const line = formatEnrichedEntry(entry);
  expect(line).toContain('GET');
  expect(line).toContain('/health');
  expect(line).toContain('80ms');
  expect(line).toContain('req-1');
  expect(line).toContain('localhost');
});

test('formatEnrichedEntry handles missing fields', () => {
  const line = formatEnrichedEntry({ method: 'POST' });
  expect(line).toContain('POST');
});

test('formatEnrichedTable has header row', () => {
  const out = formatEnrichedTable([entry]);
  expect(out).toContain('method');
  expect(out).toContain('status');
});

test('formatEnrichedTable has data row', () => {
  const out = formatEnrichedTable([entry]);
  expect(out).toContain('GET');
  expect(out).toContain('fast');
});

test('formatEnrichedJson returns valid JSON', () => {
  const out = formatEnrichedJson([entry]);
  const parsed = JSON.parse(out);
  expect(parsed).toHaveLength(1);
  expect(parsed[0].requestId).toBe('req-1');
});
