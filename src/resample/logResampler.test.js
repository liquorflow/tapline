const {
  resampleByInterval,
  resampleToCount,
  aggregateBucket,
  resampleAggregate
} = require('./logResampler');

const base = (ts, duration = 100, status = 200) => ({
  timestamp: ts,
  method: 'GET',
  path: '/api/test',
  status,
  duration
});

const entries = [
  base('2024-01-01T00:00:00.000Z', 100),
  base('2024-01-01T00:00:00.200Z', 200),
  base('2024-01-01T00:00:01.000Z', 300),
  base('2024-01-01T00:00:01.500Z', 400),
  base('2024-01-01T00:00:02.000Z', 150)
];

describe('resampleByInterval', () => {
  test('first strategy returns one per bucket', () => {
    const result = resampleByInterval(entries, 1000, 'first');
    expect(result.length).toBe(3);
    expect(result[0].duration).toBe(100);
  });

  test('last strategy returns last in bucket', () => {
    const result = resampleByInterval(entries, 1000, 'last');
    expect(result[0].duration).toBe(200);
  });

  test('median strategy returns middle entry', () => {
    const result = resampleByInterval(entries, 1000, 'median');
    expect(result[0].duration).toBe(200);
  });

  test('single bucket when interval is large', () => {
    const result = resampleByInterval(entries, 60000);
    expect(result.length).toBe(1);
  });
});

describe('resampleToCount', () => {
  test('returns all if under limit', () => {
    expect(resampleToCount(entries, 10).length).toBe(5);
  });

  test('reduces to target count', () => {
    const result = resampleToCount(entries, 3);
    expect(result.length).toBe(3);
  });

  test('includes first and last', () => {
    const result = resampleToCount(entries, 2);
    expect(result[0]).toBe(entries[0]);
    expect(result[1]).toBe(entries[entries.length - 1]);
  });
});

describe('aggregateBucket', () => {
  test('computes average duration', () => {
    const r = aggregateBucket([base('t', 100), base('t', 200)]);
    expect(r.duration).toBe(150);
  });

  test('picks dominant status', () => {
    const r = aggregateBucket([base('t', 100, 200), base('t', 100, 200), base('t', 100, 500)]);
    expect(r.status).toBe(200);
  });

  test('returns null for empty', () => {
    expect(aggregateBucket([])).toBeNull();
  });
});

describe('resampleAggregate', () => {
  test('returns one entry per bucket with sampleSize', () => {
    const result = resampleAggregate(entries, 1000);
    expect(result.length).toBe(3);
    expect(result[0]._sampleSize).toBe(2);
  });
});
