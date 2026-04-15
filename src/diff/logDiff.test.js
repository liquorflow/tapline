const { diffEntries, getChangedFields, summarizeDiff } = require('./logDiff');

const makeEntry = (overrides = {}) => ({
  method: 'GET',
  path: '/api/users',
  status: 200,
  duration: 45,
  size: 512,
  ...overrides,
});

describe('getChangedFields', () => {
  test('returns empty object when entries are identical', () => {
    const e = makeEntry();
    expect(getChangedFields(e, { ...e })).toEqual({});
  });

  test('detects status change', () => {
    const base = makeEntry({ status: 200 });
    const compare = makeEntry({ status: 404 });
    expect(getChangedFields(base, compare)).toEqual({
      status: { from: 200, to: 404 },
    });
  });

  test('detects multiple field changes', () => {
    const base = makeEntry({ status: 200, duration: 30 });
    const compare = makeEntry({ status: 500, duration: 900 });
    const delta = getChangedFields(base, compare);
    expect(delta.status).toEqual({ from: 200, to: 500 });
    expect(delta.duration).toEqual({ from: 30, to: 900 });
  });
});

describe('diffEntries', () => {
  test('identifies added entries', () => {
    const base = [makeEntry({ path: '/api/users' })];
    const compare = [
      makeEntry({ path: '/api/users' }),
      makeEntry({ path: '/api/posts' }),
    ];
    const { added } = diffEntries(base, compare);
    expect(added).toHaveLength(1);
    expect(added[0].path).toBe('/api/posts');
  });

  test('identifies removed entries', () => {
    const base = [
      makeEntry({ path: '/api/users' }),
      makeEntry({ path: '/api/old' }),
    ];
    const compare = [makeEntry({ path: '/api/users' })];
    const { removed } = diffEntries(base, compare);
    expect(removed).toHaveLength(1);
    expect(removed[0].path).toBe('/api/old');
  });

  test('identifies changed entries', () => {
    const base = [makeEntry({ status: 200 })];
    const compare = [makeEntry({ status: 503 })];
    const { changed } = diffEntries(base, compare);
    expect(changed).toHaveLength(1);
    expect(changed[0].delta.status).toEqual({ from: 200, to: 503 });
  });

  test('returns empty arrays when sessions are identical', () => {
    const entries = [makeEntry()];
    const result = diffEntries(entries, [...entries]);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.changed).toHaveLength(0);
  });
});

describe('summarizeDiff', () => {
  test('formats counts correctly', () => {
    const diff = { added: [1, 2], removed: [3], changed: [] };
    const summary = summarizeDiff(diff);
    expect(summary).toContain('Added:   2');
    expect(summary).toContain('Removed: 1');
    expect(summary).toContain('Changed: 0');
  });
});
