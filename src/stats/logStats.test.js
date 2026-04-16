const { countByMethod, countByStatus, latencyStats, summarizeStats } = require('./logStats');

const sampleEntries = [
  { method: 'GET',  status: 200, duration: 120 },
  { method: 'GET',  status: 200, duration: 340 },
  { method: 'POST', status: 201, duration: 80  },
  { method: 'GET',  status: 404, duration: 55  },
  { method: 'DELETE', status: 500, duration: 900 },
];

describe('countByMethod', () => {
  it('counts entries per method', () => {
    const result = countByMethod(sampleEntries);
    expect(result.GET).toBe(3);
    expect(result.POST).toBe(1);
    expect(result.DELETE).toBe(1);
  });

  it('returns empty object for no entries', () => {
    expect(countByMethod([])).toEqual({});
  });

  it('handles missing method as UNKNOWN', () => {
    const result = countByMethod([{ status: 200 }]);
    expect(result.UNKNOWN).toBe(1);
  });
});

describe('countByStatus', () => {
  it('counts entries per status code', () => {
    const result = countByStatus(sampleEntries);
    expect(result['200']).toBe(2);
    expect(result['201']).toBe(1);
    expect(result['404']).toBe(1);
    expect(result['500']).toBe(1);
  });

  it('returns empty object for no entries', () => {
    expect(countByStatus([])).toEqual({});
  });
});

describe('latencyStats', () => {
  it('computes min, max, avg, p95', () => {
    const result = latencyStats(sampleEntries);
    expect(result.min).toBe(55);
    expect(result.max).toBe(900);
    expect(result.avg).toBe(299);
    expect(result.count).toBe(5);
    expect(typeof result.p95).toBe('number');
  });

  it('returns nulls when no valid durations', () => {
    const result = latencyStats([{ method: 'GET' }]);
    expect(result.min).toBeNull();
    expect(result.max).toBeNull();
    expect(result.avg).toBeNull();
    expect(result.count).toBe(0);
  });

  it('filters out non-numeric durations', () => {
    const entries = [{ duration: 100 }, { duration: 'fast' }, { duration: NaN }];
    const result = latencyStats(entries);
    expect(result.count).toBe(1);
    expect(result.min).toBe(100);
  });
});

describe('summarizeStats', () => {
  it('returns a full stats object', () => {
    const result = summarizeStats(sampleEntries);
    expect(result.total).toBe(5);
    expect(result.byMethod).toBeDefined();
    expect(result.byStatus).toBeDefined();
    expect(result.latency).toBeDefined();
  });

  it('handles empty entries array', () => {
    const result = summarizeStats([]);
    expect(result.total).toBe(0);
    expect(result.byMethod).toEqual({});
    expect(result.latency.count).toBe(0);
  });
});
