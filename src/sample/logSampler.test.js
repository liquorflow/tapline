const { sampleEveryN, sampleRandom, sampleHead, sampleTail, sampleByRate, sampleEntries } = require('./logSampler');

const makeEntries = (n) =>
  Array.from({ length: n }, (_, i) => ({ id: i, method: 'GET', path: `/p/${i}`, status: 200 }));

describe('sampleEveryN', () => {
  it('returns every nth entry', () => {
    const result = sampleEveryN(makeEntries(6), 2);
    expect(result.map(e => e.id)).toEqual([0, 2, 4]);
  });
  it('throws if n < 1', () => {
    expect(() => sampleEveryN(makeEntries(4), 0)).toThrow();
  });
});

describe('sampleRandom', () => {
  it('returns count entries', () => {
    const result = sampleRandom(makeEntries(20), 5);
    expect(result).toHaveLength(5);
  });
  it('returns all if count >= length', () => {
    const entries = makeEntries(3);
    expect(sampleRandom(entries, 10)).toHaveLength(3);
  });
});

describe('sampleHead', () => {
  it('returns first N entries', () => {
    const result = sampleHead(makeEntries(10), 3);
    expect(result.map(e => e.id)).toEqual([0, 1, 2]);
  });
});

describe('sampleTail', () => {
  it('returns last N entries', () => {
    const result = sampleTail(makeEntries(10), 3);
    expect(result.map(e => e.id)).toEqual([7, 8, 9]);
  });
});

describe('sampleByRate', () => {
  it('returns empty for rate 0', () => {
    expect(sampleByRate(makeEntries(10), 0)).toHaveLength(0);
  });
  it('returns all for rate 1', () => {
    expect(sampleByRate(makeEntries(10), 1)).toHaveLength(10);
  });
  it('returns roughly half for rate 0.5', () => {
    const result = sampleByRate(makeEntries(100), 0.5);
    expect(result.length).toBeGreaterThan(30);
    expect(result.length).toBeLessThan(70);
  });
});

describe('sampleEntries', () => {
  it('defaults to head 10', () => {
    expect(sampleEntries(makeEntries(20))).toHaveLength(10);
  });
  it('supports every mode', () => {
    const r = sampleEntries(makeEntries(9), { mode: 'every', value: 3 });
    expect(r.map(e => e.id)).toEqual([0, 3, 6]);
  });
  it('throws on unknown mode', () => {
    expect(() => sampleEntries(makeEntries(5), { mode: 'bogus' })).toThrow();
  });
});
