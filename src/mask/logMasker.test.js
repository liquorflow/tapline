const { maskHeaders, maskPath, maskQueryParams, maskEntry, maskEntries } = require('./logMasker');

describe('maskHeaders', () => {
  test('masks default sensitive headers', () => {
    const h = { authorization: 'Bearer abc', 'content-type': 'application/json' };
    const result = maskHeaders(h);
    expect(result.authorization).toBe('***');
    expect(result['content-type']).toBe('application/json');
  });

  test('masks custom fields case-insensitively', () => {
    const h = { 'X-Secret': 'hidden', other: 'ok' };
    const result = maskHeaders(h, ['x-secret']);
    expect(result['X-Secret']).toBe('***');
    expect(result.other).toBe('ok');
  });

  test('returns empty object unchanged', () => {
    expect(maskHeaders({})).toEqual({});
  });
});

describe('maskPath', () => {
  test('masks regex pattern in path', () => {
    expect(maskPath('/users/42/profile', /\/\d+/)).toBe('/users/***/profile');
  });

  test('masks string pattern', () => {
    expect(maskPath('/api/secret/data', 'secret')).toBe('/api/***/data');
  });

  test('returns path unchanged if no pattern', () => {
    expect(maskPath('/api/data')).toBe('/api/data');
  });
});

describe('maskQueryParams', () => {
  test('masks specified query params', () => {
    const result = maskQueryParams('/search?q=hello&token=abc123', ['token']);
    expect(result).toBe('/search?q=hello&token=***');
  });

  test('leaves unmasked params alone', () => {
    const result = maskQueryParams('/search?q=hello&page=2', ['token']);
    expect(result).toBe('/search?q=hello&page=2');
  });

  test('no params returns path unchanged', () => {
    expect(maskQueryParams('/path?x=1')).toBe('/path?x=1');
  });
});

describe('maskEntry', () => {
  const entry = {
    method: 'GET',
    path: '/api/users/99?token=secret',
    status: 200,
    headers: { authorization: 'Bearer xyz', 'content-type': 'text/plain' },
    latency: 120
  };

  test('masks headers and query params', () => {
    const result = maskEntry(entry, { queryParams: ['token'] });
    expect(result.headers.authorization).toBe('***');
    expect(result.path).toContain('token=***');
    expect(result.status).toBe(200);
  });

  test('does not mutate original entry', () => {
    maskEntry(entry, { queryParams: ['token'] });
    expect(entry.headers.authorization).toBe('Bearer xyz');
  });
});

describe('maskEntries', () => {
  test('masks all entries', () => {
    const entries = [
      { path: '/a?key=val', headers: { cookie: 'session=abc' } },
      { path: '/b', headers: { 'x-api-key': '1234' } }
    ];
    const result = maskEntries(entries, { queryParams: ['key'] });
    expect(result[0].path).toBe('/a?key=***');
    expect(result[0].headers.cookie).toBe('***');
    expect(result[1].headers['x-api-key']).toBe('***');
  });
});
