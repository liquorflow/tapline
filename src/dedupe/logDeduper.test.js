const { entryKey, dedupeFirst, dedupeLast, countDuplicates, dedupeEntries } = require('./logDeduper');

const entries = [
  { method: 'GET', path: '/api/users', status: 200, latency: 50 },
  { method: 'GET', path: '/api/users', status: 200, latency: 80 },
  { method: 'POST', path: '/api/users', status: 201, latency: 120 },
  { method: 'GET', path: '/api/items', status: 200, latency: 30 },
  { method: 'GET', path: '/api/users', status: 200, latency: 95 },
];

describe('entryKey', () => {
  test('generates key from specified fields', () => {
    const entry = { method: 'GET', path: '/foo', status: 200 };
    expect(entryKey(entry, ['method', 'path'])).toBe('GET|/foo');
  });

  test('handles missing fields gracefully', () => {
    const entry = { method: 'GET' };
    expect(entryKey(entry, ['method', 'path'])).toBe('GET|');
  });
});

describe('dedupeFirst', () => {
  test('keeps first occurrence of duplicates', () => {
    const result = dedupeFirst(entries);
    expect(result).toHaveLength(3);
    expect(result[0].latency).toBe(50);
  });

  test('uses custom fields', () => {
    const result = dedupeFirst(entries, ['method']);
    expect(result).toHaveLength(2);
  });

  test('returns all entries when no duplicates', () => {
    const unique = [
      { method: 'GET', path: '/a', status: 200 },
      { method: 'POST', path: '/b', status: 201 },
    ];
    expect(dedupeFirst(unique)).toHaveLength(2);
  });
});

describe('dedupeLast', () => {
  test('keeps last occurrence of duplicates', () => {
    const result = dedupeLast(entries);
    expect(result).toHaveLength(3);
    const getUserEntry = result.find(e => e.path === '/api/users' && e.method === 'GET');
    expect(getUserEntry.latency).toBe(95);
  });

  test('preserves insertion order of unique keys', () => {
    const result = dedupeLast(entries);
    expect(result.map(e => e.path)).toEqual(['/api/users', '/api/users', '/api/items']);
  });
});

describe('countDuplicates', () => {
  test('counts duplicate entries correctly', () => {
    expect(countDuplicates(entries)).toBe(2);
  });

  test('returns 0 when no duplicates', () => {
    expect(countDuplicates([entries[0], entries[2]])).toBe(0);
  });
});

describe('dedupeEntries', () => {
  test('defaults to first strategy', () => {
    const result = dedupeEntries(entries);
    expect(result[0].latency).toBe(50);
  });

  test('uses last strategy when specified', () => {
    const result = dedupeEntries(entries, { strategy: 'last' });
    const getUserEntry = result.find(e => e.path === '/api/users' && e.method === 'GET');
    expect(getUserEntry.latency).toBe(95);
  });

  test('accepts custom fields option', () => {
    const result = dedupeEntries(entries, { fields: ['path'] });
    expect(result).toHaveLength(2);
  });
});
