const { buildIndex, lookup, buildIndexes, lookupAny, summarizeIndex } = require('./logIndexer');
const { formatIndexTable, formatIndexJson, formatIndexSummary } = require('./indexFormatter');

const entries = [
  { method: 'GET',  path: '/a', status: 200 },
  { method: 'POST', path: '/b', status: 201 },
  { method: 'GET',  path: '/c', status: 200 },
  { method: 'GET',  path: '/a', status: 404 },
];

describe('buildIndex', () => {
  test('groups entries by field', () => {
    const idx = buildIndex(entries, 'method');
    expect(idx.get('GET')).toHaveLength(3);
    expect(idx.get('POST')).toHaveLength(1);
  });

  test('handles missing field as __unknown__', () => {
    const idx = buildIndex([{ foo: 1 }, {}], 'method');
    expect(idx.get('__unknown__')).toHaveLength(2);
  });
});

describe('lookup', () => {
  test('returns matching entries', () => {
    const idx = buildIndex(entries, 'status');
    expect(lookup(idx, 200)).toHaveLength(2);
  });

  test('returns empty array for missing key', () => {
    const idx = buildIndex(entries, 'method');
    expect(lookup(idx, 'DELETE')).toEqual([]);
  });
});

describe('buildIndexes', () => {
  test('builds multiple indexes', () => {
    const indexes = buildIndexes(entries, ['method', 'status']);
    expect(indexes.method).toBeInstanceOf(Map);
    expect(indexes.status.get('200')).toHaveLength(2);
  });
});

describe('lookupAny', () => {
  test('returns union of matches without duplicates', () => {
    const idx = buildIndex(entries, 'status');
    const results = lookupAny(idx, [200, 201]);
    expect(results).toHaveLength(3);
  });
});

describe('summarizeIndex', () => {
  test('returns sorted key/count rows', () => {
    const idx = buildIndex(entries, 'method');
    const summary = summarizeIndex(idx);
    expect(summary[0].key).toBe('GET');
    expect(summary[0].count).toBe(3);
  });
});

describe('formatIndexTable', () => {
  test('returns a table string', () => {
    const idx = buildIndex(entries, 'method');
    const out = formatIndexTable(idx, 'method');
    expect(out).toContain('GET');
    expect(out).toContain('3');
  });

  test('handles empty index', () => {
    expect(formatIndexTable(new Map())).toBe('No entries in index.');
  });
});

describe('formatIndexJson', () => {
  test('returns valid JSON', () => {
    const idx = buildIndex(entries, 'method');
    const parsed = JSON.parse(formatIndexJson(idx));
    expect(Array.isArray(parsed)).toBe(true);
  });
});

describe('formatIndexSummary', () => {
  test('returns summary string', () => {
    const idx = buildIndex(entries, 'method');
    const s = formatIndexSummary(idx, 'method');
    expect(s).toContain("Index on 'method'");
    expect(s).toContain('2 unique values');
  });
});
