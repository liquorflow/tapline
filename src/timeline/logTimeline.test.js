const { bucketByInterval, timelineSpan, summarizeTimeline } = require('./logTimeline');
const { formatTimelineTable, formatTimelineJson, formatTimelineSummary } = require('./timelineFormatter');

const entries = [
  { timestamp: '2024-01-01T00:00:10Z', duration: 100, status: 200 },
  { timestamp: '2024-01-01T00:00:40Z', duration: 200, status: 500 },
  { timestamp: '2024-01-01T00:01:15Z', duration: 150, status: 200 },
  { timestamp: '2024-01-01T00:02:05Z', duration: 300, status: 404 },
];

test('bucketByInterval groups entries into 60s windows', () => {
  const buckets = bucketByInterval(entries, 60);
  expect(buckets.length).toBe(3);
  expect(buckets[0].entries.length).toBe(2);
  expect(buckets[1].entries.length).toBe(1);
});

test('bucketByInterval returns empty for no entries', () => {
  expect(bucketByInterval([], 60)).toEqual([]);
});

test('timelineSpan returns correct first/last/duration', () => {
  const span = timelineSpan(entries);
  expect(span).not.toBeNull();
  expect(span.durationMs).toBe(
    new Date('2024-01-01T00:02:05Z') - new Date('2024-01-01T00:00:10Z')
  );
});

test('timelineSpan returns null for empty entries', () => {
  expect(timelineSpan([])).toBeNull();
});

test('summarizeTimeline counts errors correctly', () => {
  const buckets = bucketByInterval(entries, 60);
  const summary = summarizeTimeline(buckets);
  expect(summary[0].errorCount).toBe(1);
  expect(summary[1].errorCount).toBe(0);
});

test('formatTimelineTable returns tab-separated rows', () => {
  const buckets = bucketByInterval(entries, 60);
  const out = formatTimelineTable(buckets);
  expect(out).toContain('Window');
  expect(out).toContain('Count');
});

test('formatTimelineJson returns valid JSON', () => {
  const buckets = bucketByInterval(entries, 60);
  const json = JSON.parse(formatTimelineJson(buckets));
  expect(Array.isArray(json)).toBe(true);
  expect(json[0]).toHaveProperty('windowStart');
});

test('formatTimelineSummary includes total requests', () => {
  const buckets = bucketByInterval(entries, 60);
  const span = timelineSpan(entries);
  const out = formatTimelineSummary(buckets, span);
  expect(out).toContain('Total requests: 4');
  expect(out).toContain('Span:');
});
