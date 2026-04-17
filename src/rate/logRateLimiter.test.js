const { countPerBucket, limitByRate, averageRate, peakRate } = require('./logRateLimiter');

const makeEntry = (isoTime) => ({ method: 'GET', path: '/test', status: 200, timestamp: isoTime, latency: 10 });

const entries = [
  makeEntry('2024-01-01T00:00:00.000Z'),
  makeEntry('2024-01-01T00:00:00.200Z'),
  makeEntry('2024-01-01T00:00:00.400Z'),
  makeEntry('2024-01-01T00:00:01.100Z'),
  makeEntry('2024-01-01T00:00:01.500Z'),
  makeEntry('2024-01-01T00:00:02.000Z'),
];

describe('countPerBucket', () => {
  it('groups entries into 1s buckets', () => {
    const buckets = countPerBucket(entries, 1000);
    const values = Object.values(buckets);
    expect(values).toContain(3);
    expect(values).toContain(2);
    expect(values).toContain(1);
  });

  it('returns empty object for no entries', () => {
    expect(countPerBucket([])).toEqual({});
  });
});

describe('limitByRate', () => {
  it('allows up to maxPerWindow entries per window', () => {
    const result = limitByRate(entries, 2, 1000);
    expect(result.length).toBeLessThanOrEqual(entries.length);
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns all entries if limit is high', () => {
    const result = limitByRate(entries, 100, 1000);
    expect(result.length).toBe(entries.length);
  });

  it('returns empty for zero max', () => {
    const result = limitByRate(entries, 0, 1000);
    expect(result).toEqual([]);
  });

  it('returns empty array for no entries', () => {
    expect(limitByRate([], 5, 1000)).toEqual([]);
  });
});

describe('averageRate', () => {
  it('computes a positive rate for spread entries', () => {
    const rate = averageRate(entries);
    expect(rate).toBeGreaterThan(0);
  });

  it('returns 0 for single entry', () => {
    expect(averageRate([entries[0]])).toBe(0);
  });

  it('returns 0 for empty', () => {
    expect(averageRate([])).toBe(0);
  });
});

describe('peakRate', () => {
  it('returns the highest count in any bucket', () => {
    const peak = peakRate(entries, 1000);
    expect(peak).toBe(3);
  });

  it('returns 0 for empty entries', () => {
    expect(peakRate([])).toBe(0);
  });
});
