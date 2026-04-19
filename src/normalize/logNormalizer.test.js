const {
  normalizeMethod,
  normalizePath,
  normalizeStatus,
  normalizeDuration,
  normalizeTimestamp,
  normalizeEntry,
  normalizeEntries,
} = require('./logNormalizer');

describe('normalizeMethod', () => {
  it('uppercases valid methods', () => expect(normalizeMethod('get')).toBe('GET'));
  it('trims whitespace', () => expect(normalizeMethod('  post  ')).toBe('POST'));
  it('returns UNKNOWN for null', () => expect(normalizeMethod(null)).toBe('UNKNOWN'));
  it('returns UNKNOWN for empty string', () => expect(normalizeMethod('')).toBe('UNKNOWN'));
});

describe('normalizePath', () => {
  it('preserves valid path', () => expect(normalizePath('/api/users')).toBe('/api/users'));
  it('prepends slash if missing', () => expect(normalizePath('api/users')).toBe('/api/users'));
  it('returns / for null', () => expect(normalizePath(null)).toBe('/'));
  it('trims whitespace', () => expect(normalizePath('  /foo  ')).toBe('/foo'));
});

describe('normalizeStatus', () => {
  it('parses integer string', () => expect(normalizeStatus('200')).toBe(200));
  it('returns 0 for NaN', () => expect(normalizeStatus('abc')).toBe(0));
  it('handles numeric input', () => expect(normalizeStatus(404)).toBe(404));
});

describe('normalizeDuration', () => {
  it('parses float string', () => expect(normalizeDuration('123.4')).toBe(123.4));
  it('returns 0 for negative', () => expect(normalizeDuration(-5)).toBe(0));
  it('returns 0 for NaN', () => expect(normalizeDuration('x')).toBe(0));
});

describe('normalizeTimestamp', () => {
  it('returns ISO string for valid date', () => {
    const result = normalizeTimestamp('2024-01-15T10:00:00Z');
    expect(result).toBe('2024-01-15T10:00:00.000Z');
  });
  it('returns null for invalid date', () => expect(normalizeTimestamp('not-a-date')).toBeNull());
  it('returns null for null input', () => expect(normalizeTimestamp(null)).toBeNull());
});

describe('normalizeEntry', () => {
  it('normalizes a full entry', () => {
    const entry = { method: 'get', path: 'users', status: '200', duration: '45', timestamp: '2024-01-01T00:00:00Z', headers: { 'x-id': '1' }, body: null };
    const result = normalizeEntry(entry);
    expect(result.method).toBe('GET');
    expect(result.path).toBe('/users');
    expect(result.status).toBe(200);
    expect(result.duration).toBe(45);
  });

  it('fills defaults for empty entry', () => {
    const result = normalizeEntry({});
    expect(result.method).toBe('UNKNOWN');
    expect(result.path).toBe('/');
    expect(result.status).toBe(0);
    expect(result.headers).toEqual({});
  });

  it('handles null input', () => {
    const result = normalizeEntry(null);
    expect(result.method).toBe('UNKNOWN');
  });
});

describe('normalizeEntries', () => {
  it('normalizes array of entries', () => {
    const entries = [{ method: 'post', path: '/x', status: 201, duration: 10 }];
    const result = normalizeEntries(entries);
    expect(result).toHaveLength(1);
    expect(result[0].method).toBe('POST');
  });

  it('returns empty array for non-array', () => {
    expect(normalizeEntries(null)).toEqual([]);
  });
});
