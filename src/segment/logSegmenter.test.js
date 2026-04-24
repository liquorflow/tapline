const {
  segmentByCount,
  segmentIntoN,
  segmentByTime,
  segmentByField,
  segmentEntries
} = require('./logSegmenter');
const { formatSegmentTable, formatSegmentJson, formatSegmentSummary } = require('./segmentFormatter');

const makeEntry = (i, method = 'GET', duration = 100) => ({
  timestamp: new Date(1700000000000 + i * 5000).toISOString(),
  method,
  path: `/path/${i}`,
  status: 200,
  duration
});

const entries = Array.from({ length: 10 }, (_, i) => makeEntry(i, i % 2 === 0 ? 'GET' : 'POST', (i + 1) * 10));

describe('segmentByCount', () => {
  it('splits into chunks of given size', () => {
    const segs = segmentByCount(entries, 3);
    expect(segs.length).toBe(4);
    expect(segs[0].entries.length).toBe(3);
    expect(segs[3].entries.length).toBe(1);
  });

  it('labels segments sequentially', () => {
    const segs = segmentByCount(entries, 5);
    expect(segs[0].label).toBe('segment-1');
    expect(segs[1].label).toBe('segment-2');
  });

  it('throws for size < 1', () => {
    expect(() => segmentByCount(entries, 0)).toThrow();
  });
});

describe('segmentIntoN', () => {
  it('splits into N segments', () => {
    const segs = segmentIntoN(entries, 2);
    expect(segs.length).toBe(2);
    expect(segs[0].entries.length + segs[1].entries.length).toBe(10);
  });

  it('throws for n < 1', () => {
    expect(() => segmentIntoN(entries, 0)).toThrow();
  });
});

describe('segmentByTime', () => {
  it('groups entries by time bucket', () => {
    const segs = segmentByTime(entries, 15000);
    expect(segs.length).toBeGreaterThan(0);
    segs.forEach(s => {
      expect(s).toHaveProperty('start');
      expect(s).toHaveProperty('end');
      expect(s.entries.length).toBeGreaterThan(0);
    });
  });

  it('returns empty array for no entries', () => {
    expect(segmentByTime([], 1000)).toEqual([]);
  });
});

describe('segmentByField', () => {
  it('groups by method', () => {
    const segs = segmentByField(entries, 'method');
    const labels = segs.map(s => s.label).sort();
    expect(labels).toEqual(['GET', 'POST']);
  });
});

describe('segmentEntries', () => {
  it('dispatches by count', () => {
    const segs = segmentEntries(entries, { by: 'count', size: 5 });
    expect(segs.length).toBe(2);
  });

  it('dispatches by field', () => {
    const segs = segmentEntries(entries, { by: 'field', field: 'method' });
    expect(segs.length).toBe(2);
  });

  it('throws for unknown strategy', () => {
    expect(() => segmentEntries(entries, { by: 'bogus' })).toThrow();
  });
});

describe('segmentFormatter', () => {
  const segs = segmentByCount(entries, 5);

  it('formatSegmentTable returns a string with labels', () => {
    const out = formatSegmentTable(segs);
    expect(out).toContain('segment-1');
    expect(out).toContain('count=');
  });

  it('formatSegmentJson returns valid JSON', () => {
    const out = formatSegmentJson(segs);
    const parsed = JSON.parse(out);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toHaveProperty('label');
    expect(parsed[0]).toHaveProperty('count');
  });

  it('formatSegmentSummary includes segment count', () => {
    const out = formatSegmentSummary(segs);
    expect(out).toContain('2 segment(s)');
    expect(out).toContain('10 total entries');
  });

  it('formatSegmentTable handles empty input', () => {
    expect(formatSegmentTable([])).toBe('(no segments)');
  });
});
