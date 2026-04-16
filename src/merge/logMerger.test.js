const { mergeSorted, mergeAll, mergeUnique, tagSource } = require('./logMerger');

const e = (method, path, timestamp, status = 200) => ({ method, path, timestamp, status });

const a = [
  e('GET', '/a', '2024-01-01T10:00:00Z'),
  e('GET', '/c', '2024-01-01T10:02:00Z'),
];
const b = [
  e('POST', '/b', '2024-01-01T10:01:00Z'),
  e('DELETE', '/d', '2024-01-01T10:03:00Z'),
];

describe('mergeSorted', () => {
  it('interleaves two arrays by timestamp', () => {
    const result = mergeSorted(a, b);
    expect(result.map(r => r.path)).toEqual(['/a', '/b', '/c', '/d']);
  });

  it('handles empty first array', () => {
    expect(mergeSorted([], b)).toEqual(b);
  });

  it('handles empty second array', () => {
    expect(mergeSorted(a, [])).toEqual(a);
  });
});

describe('mergeAll', () => {
  it('merges multiple sources', () => {
    const result = mergeAll([a, b]);
    expect(result).toHaveLength(4);
    expect(result[0].path).toBe('/a');
    expect(result[1].path).toBe('/b');
  });

  it('returns empty for empty input', () => {
    expect(mergeAll([])).toEqual([]);
  });

  it('handles single source', () => {
    expect(mergeAll([a])).toEqual(a);
  });
});

describe('mergeUnique', () => {
  it('removes duplicates across sources', () => {
    const dup = [e('GET', '/a', '2024-01-01T10:00:00Z')];
    const result = mergeUnique([a, dup]);
    const paths = result.map(r => r.path);
    expect(paths.filter(p => p === '/a'aveLength(1);
  });

  it('supports custom key function', () => {
    const c = [e('GET', '/a', '2024-01-01T10:00:00Z', 404)];
    const result = mer e => `${e.path}`);
    expect(result.filter(r => r.path === '/a')).toHaveLength(1);
  });
});

describe('tagSource', () => {
  it('adds _source label to each entry', () => {
    const tagged = tagSource(a, 'fileA');
    expect(tagged.every(e => e._source === 'fileA')).toBe(true);
  });

  it('does not mutate original entries', () => {
    tagSource(a, 'x');
    expect(a[0]._source).toBeUndefined();
  });
});
