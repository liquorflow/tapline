const {
  formatResampleTable,
  formatResampleJson,
  formatResampleSummary
} = require('./resampleFormatter');

const entries = [
  { timestamp: '2024-01-01T00:00:00.000Z', method: 'GET', path: '/api/x', status: 200, duration: 120, _sampleSize: 3 },
  { timestamp: '2024-01-01T00:00:01.000Z', method: 'POST', path: '/api/y', status: 500, duration: 800, _sampleSize: 1 }
];

describe('formatResampleTable', () => {
  test('includes header row', () => {
    const out = formatResampleTable(entries);
    expect(out).toContain('Timestamp');
    expect(out).toContain('Samples');
  });

  test('includes entry data', () => {
    const out = formatResampleTable(entries);
    expect(out).toContain('/api/x');
    expect(out).toContain('120ms');
    expect(out).toContain('3');
  });

  test('handles empty entries', () => {
    expect(formatResampleTable([])).toBe('No entries.');
  });
});

describe('formatResampleJson', () => {
  test('returns valid JSON', () => {
    const out = formatResampleJson(entries);
    const parsed = JSON.parse(out);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].path).toBe('/api/x');
  });
});

describe('formatResampleSummary', () => {
  test('reports bucket count and totals', () => {
    const out = formatResampleSummary(entries);
    expect(out).toContain('2 buckets');
    expect(out).toContain('4 original entries');
  });

  test('reports avg duration', () => {
    const out = formatResampleSummary(entries);
    expect(out).toContain('avg duration');
    expect(out).toContain('460ms');
  });

  test('handles empty', () => {
    const out = formatResampleSummary([]);
    expect(out).toContain('0 buckets');
  });
});
