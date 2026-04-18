const { buildTraceMap, traceById, buildTrace, traceSpan, summarizeTraces, traceEntries } = require('./logTracer');

const entries = [
  { requestId: 'abc', timestamp: '2024-01-01T00:00:01Z', status: 200, method: 'GET', path: '/a' },
  { requestId: 'abc', timestamp: '2024-01-01T00:00:03Z', status: 201, method: 'POST', path: '/b' },
  { requestId: 'xyz', timestamp: '2024-01-01T00:00:02Z', status: 500, method: 'GET', path: '/c' },
  { timestamp: '2024-01-01T00:00:04Z', status: 200, method: 'GET', path: '/d' }
];

test('buildTraceMap groups by requestId', () => {
  const map = buildTraceMap(entries);
  expect(map.get('abc').length).toBe(2);
  expect(map.get('xyz').length).toBe(1);
  expect(map.has(undefined)).toBe(false);
});

test('traceById returns matching entries', () => {
  const result = traceById(entries, 'abc');
  expect(result.length).toBe(2);
});

test('buildTrace sorts by timestamp', () => {
  const group = [entries[1], entries[0]];
  const sorted = buildTrace(group);
  expect(sorted[0].timestamp).toBe('2024-01-01T00:00:01Z');
});

test('traceSpan returns correct duration', () => {
  const group = entries.slice(0, 2);
  const span = traceSpan(group);
  expect(span.durationMs).toBe(2000);
});

test('traceSpan returns zeros for empty', () => {
  const span = traceSpan([]);
  expect(span.durationMs).toBe(0);
});

test('summarizeTraces returns one row per trace id', () => {
  const summary = summarizeTraces(entries);
  expect(summary.length).toBe(2);
  const abc = summary.find(s => s.id === 'abc');
  expect(abc.count).toBe(2);
});

test('traceEntries returns sorted groups', () => {
  const traces = traceEntries(entries);
  expect(Object.keys(traces)).toContain('abc');
  expect(traces['abc'][0].timestamp).toBe('2024-01-01T00:00:01Z');
});
