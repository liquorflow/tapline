const { scoreLatency, scoreStatus, scoreMethod, scoreEntry, scoreEntries, topScored } = require('./logScorer');

describe('scoreLatency', () => {
  it('returns 1.0 for fast requests', () => expect(scoreLatency(50)).toBe(1.0));
  it('returns 0.75 for moderate latency', () => expect(scoreLatency(200)).toBe(0.75));
  it('returns 0.0 for very slow requests', () => expect(scoreLatency(5000)).toBe(0.0));
  it('returns 0 for null', () => expect(scoreLatency(null)).toBe(0));
});

describe('scoreStatus', () => {
  it('returns 1.0 for 2xx', () => expect(scoreStatus(200)).toBe(1.0));
  it('returns 0.75 for 3xx', () => expect(scoreStatus(301)).toBe(0.75));
  it('returns 0.4 for 4xx', () => expect(scoreStatus(404)).toBe(0.4));
  it('returns 0.0 for 5xx', () => expect(scoreStatus(500)).toBe(0.0));
  it('returns 0 for missing status', () => expect(scoreStatus(null)).toBe(0));
});

describe('scoreMethod', () => {
  it('returns 1.0 for GET', () => expect(scoreMethod('GET')).toBe(1.0));
  it('returns 0.7 for POST', () => expect(scoreMethod('POST')).toBe(0.7));
  it('returns 0.5 for missing method', () => expect(scoreMethod(null)).toBe(0.5));
});

describe('scoreEntry', () => {
  it('scores a healthy entry near 1', () => {
    const entry = { method: 'GET', status: 200, latency: 50 };
    expect(scoreEntry(entry)).toBeGreaterThan(0.9);
  });

  it('scores a bad entry low', () => {
    const entry = { method: 'POST', status: 500, latency: 5000 };
    expect(scoreEntry(entry)).toBeLessThan(0.4);
  });

  it('respects custom weights', () => {
    const entry = { method: 'GET', status: 500, latency: 50 };
    const score = scoreEntry(entry, { latency: 1.0, status: 0, method: 0 });
    expect(score).toBe(1.0);
  });
});

describe('scoreEntries', () => {
  it('attaches score to each entry', () => {
    const entries = [
      { method: 'GET', status: 200, latency: 100 },
      { method: 'POST', status: 500, latency: 2000 }
    ];
    const result = scoreEntries(entries);
    expect(result[0]).toHaveProperty('score');
    expect(result[0].score).toBeGreaterThan(result[1].score);
  });
});

describe('topScored', () => {
  it('returns top n entries by score', () => {
    const entries = Array.from({ length: 20 }, (_, i) => ({
      method: 'GET',
      status: i % 2 === 0 ? 200 : 500,
      latency: i * 100
    }));
    const top = topScored(entries, 5);
    expect(top).toHaveLength(5);
    expect(top[0].score).toBeGreaterThanOrEqual(top[4].score);
  });
});
