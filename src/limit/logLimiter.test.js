const { limitHead, limitTail, limitByTimeRange, limitByMaxLatency, limitEntries } = require('./logLimiter');

const entries = [
  { timestamp: '2024-01-01T00:00:00Z', duration: 50,  status: 200 },
  { timestamp: '2024-01-02T00:00:00Z', duration: 120, status: 404 },
  { timestamp: '2024-01-03T00:00:00Z', duration: 300, status: 500 },
  { timestamp: '2024-01-04T00:00:00Z', duration: 80,  status: 200 },
  { timestamp: '2024-01-05T00:00:00Z', duration: 20,  status: 201 },
];

describe('limitHead', () => {
  it('returns first n entries', () => {
    expect(limitHead(entries, 2)).toHaveLength(2);
    expect(limitHead(entries, 2)[0]).toBe(entries[0]);
  });
  it('returns all if n > length', () => {
    expect(limitHead(entries, 100)).toHaveLength(entries.length);
  });
});

describe('limitTail', () => {
  it('returns last n entries', () => {
    const result = limitTail(entries, 2);
    expect(result).toHaveLength(2);
    expect(result[1]).toBe(entries[entries.length - 1]);
  });
});

describe('limitByTimeRange', () => {
  it('filters entries within range', () => {
    const result = limitByTimeRange(entries, '2024-01-02T00:00:00Z', '2024-01-04T00:00:00Z');
    expect(result).toHaveLength(3);
  });
  it('returns empty if range matches nothing', () => {
    const result = limitByTimeRange(entries, '2023-01-01T00:00:00Z', '2023-12-31T00:00:00Z');
    expect(result).toHaveLength(0);
  });
});

describe('limitByMaxLatency', () => {
  it('filters entries with duration <= maxMs', () => {
    const result = limitByMaxLatency(entries, 100);
    expect(result.every(e => e.duration <= 100)).toBe(true);
  });
  it('returns all if maxMs is very high', () => {
    expect(limitByMaxLatency(entries, 9999)).toHaveLength(entries.length);
  });
});

describe('limitEntries', () => {
  it('dispatches head mode', () => {
    expect(limitEntries(entries, { mode: 'head', n: 1 })).toHaveLength(1);
  });
  it('dispatches tail mode', () => {
    expect(limitEntries(entries, { mode: 'tail', n: 2 })).toHaveLength(2);
  });
  it('dispatches time mode', () => {
    const r = limitEntries(entries, { mode: 'time', from: '2024-01-03T00:00:00Z', to: '2024-01-05T00:00:00Z' });
    expect(r).toHaveLength(3);
  });
  it('dispatches latency mode', () => {
    const r = limitEntries(entries, { mode: 'latency', maxMs: 80 });
    expect(r.every(e => e.duration <= 80)).toBe(true);
  });
  it('returns all entries for unknown mode', () => {
    expect(limitEntries(entries, { mode: 'unknown' })).toHaveLength(entries.length);
  });
});
