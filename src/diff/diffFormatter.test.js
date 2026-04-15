const { formatDiff } = require('./diffFormatter');

const makeEntry = (overrides = {}) => ({
  method: 'GET',
  path: '/api/test',
  status: 200,
  duration: 50,
  size: 256,
  ...overrides,
});

describe('formatDiff', () => {
  test('returns no-differences message when diff is empty', () => {
    const result = formatDiff({ added: [], removed: [], changed: [] }, { color: false });
    expect(result).toBe('No differences found.');
  });

  test('includes added section when there are added entries', () => {
    const diff = {
      added: [makeEntry({ path: '/api/new' })],
      removed: [],
      changed: [],
    };
    const result = formatDiff(diff, { color: false });
    expect(result).toContain('+ Added (1)');
    expect(result).toContain('/api/new');
  });

  test('includes removed section when there are removed entries', () => {
    const diff = {
      added: [],
      removed: [makeEntry({ path: '/api/gone' })],
      changed: [],
    };
    const result = formatDiff(diff, { color: false });
    expect(result).toContain('- Removed (1)');
    expect(result).toContain('/api/gone');
  });

  test('includes changed section with field deltas', () => {
    const diff = {
      added: [],
      removed: [],
      changed: [
        {
          key: 'GET:/api/test',
          base: makeEntry({ status: 200 }),
          compare: makeEntry({ status: 500 }),
          delta: { status: { from: 200, to: 500 } },
        },
      ],
    };
    const result = formatDiff(diff, { color: false });
    expect(result).toContain('~ Changed (1)');
    expect(result).toContain('status: 200');
    expect(result).toContain('500');
  });

  test('handles multiple sections at once', () => {
    const diff = {
      added: [makeEntry({ path: '/new' })],
      removed: [makeEntry({ path: '/old' })],
      changed: [],
    };
    const result = formatDiff(diff, { color: false });
    expect(result).toContain('Added');
    expect(result).toContain('Removed');
  });
});
