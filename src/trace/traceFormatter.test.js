const { formatTraceTable, formatTraceJson, formatTraceSummary } = require('./traceFormatter');

const traces = {
  'abc-123': [
    { requestId: 'abc-123', timestamp: '2024-01-01T00:00:01Z', status: 200 },
    { requestId: 'abc-123', timestamp: '2024-01-01T00:00:02Z', status: 201 }
  ],
  'xyz-456': [
    { requestId: 'xyz-456', timestamp: '2024-01-01T00:00:05Z', status: 500 }
  ]
};

test('formatTraceTable returns string with header', () => {
  const out = formatTraceTable(traces);
  expect(typeof out).toBe('string');
  expect(out).toContain('Trace ID');
  expect(out).toContain('abc-123');
});

test('formatTraceJson returns valid JSON array', () => {
  const out = formatTraceJson(traces);
  const parsed = JSON.parse(out);
  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed[0].id).toBe('abc-123');
  expect(parsed[0].count).toBe(2);
});

test('formatTraceSummary shows counts', () => {
  const out = formatTraceSummary(traces);
  expect(out).toContain('Traces: 2');
  expect(out).toContain('Total entries: 3');
});
