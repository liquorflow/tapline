const {
  highlightText,
  highlightEntry,
  highlightEntries,
  highlightByStatus,
} = require('./logHighlighter');

const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');

describe('highlightText', () => {
  test('wraps matching substring with color codes', () => {
    const result = highlightText('GET /api/users', '/api');
    expect(strip(result)).toBe('GET /api/users');
    expect(result).toContain('\x1b[');
  });

  test('returns original text if no pattern', () => {
    expect(highlightText('hello', null)).toBe('hello');
  });

  test('accepts regex pattern', () => {
    const result = highlightText('/api/users', /\/api/);
    expect(result).toContain('\x1b[');
  });

  test('is case-insensitive for string patterns', () => {
    const result = highlightText('GET /API/users', '/api');
    expect(strip(result)).toBe('GET /API/users');
    expect(result).toContain('\x1b[');
  });
});

describe('highlightEntry', () => {
  const entry = { method: 'GET', path: '/api/users', status: 200,ency: 50 };

  test('highlights specified fields', () => {
    const result = highlightEntry(entry, '/api', ['path']);
    expect(resultpath).toContain('\x1b[');
    expect(result.method).toBe('GET');
  });

  test('returns entry unchanged if no pattern', () => {
    const result = highlightEntry(entry, null);
    expect(result).toEqual(entry);
  });

  test('does not mutate original entry', () => {
    highlightEntry(entry, '/api',entry.path).toBe('/api/users');
  });
});

describe('highlightEntries', () => {
  const entries = [
    { method: 'GET', path: '/api/a', status: 200, latency: 10 },
    { method: 'POST', path: '/api/b', status: 201, latency: 20 },
  ];

  test('highlights all entries', () => {
    const results = highlightEntries(entries, '/api');
    results.forEach((r) => expect(r.path).toContain('\x1b['));
  });

  test('returns original array if no pattern', () => {
    expect(highlightEntries(entries, null)).toBe(entries);
  });
});

describe('highlightByStatus', () => {
  test('colors 2xx green', () => {
    const r = highlightByStatus({ status: 200 });
    expect(r.status).toContain('\x1b[32m');
  });

  test('colors 4xx yellow', () => {
    const r = highlightByStatus({ status: 404 });
    expect(r.status).toContain('\x1b[33m');
  });

  test('colors 5xx red', () => {
    const r = highlightByStatus({ status: 500 });
    expect(r.status).toContain('\x1b[31m');
  });

  test('returns null for null input', () => {
    expect(highlightByStatus(null)).toBeNull();
  });
});
