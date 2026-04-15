const {
  normalizeEntry,
  redactHeaders,
  bucketLatency,
  transformEntries,
} = require('./logTransformer');

const baseEntry = {
  method: 'get',
  path: '  /api/users  ',
  status: '200',
  responseTime: 120,
  headers: {
    Authorization: 'Bearer secret',
    'Content-Type': 'application/json',
    'x-api-key': 'abc123',
  },
};

describe('normalizeEntry', () => {
  it('uppercases method and trims path', () => {
    const result = normalizeEntry(baseEntry);
    expect(result.method).toBe('GET');
    expect(result.path).toBe('/api/users');
  });

  it('parses status to integer', () => {
    const result = normalizeEntry(baseEntry);
    expect(result.status).toBe(200);
  });

  it('throws on invalid input', () => {
    expect(() => normalizeEntry(null)).toThrow('Invalid entry');
    expect(() => normalizeEntry('string')).toThrow('Invalid entry');
  });

  it('preserves other fields', () => {
    const result = normalizeEntry({ ...baseEntry, custom: 'value' });
    expect(result.custom).toBe('value');
  });
});

describe('redactHeaders', () => {
  it('redacts authorization and x-api-key headers', () => {
    const result = redactHeaders(baseEntry);
    expect(result.headers['Authorization']).toBe('[REDACTED]');
    expect(result.headers['x-api-key']).toBe('[REDACTED]');
  });

  it('preserves non-sensitive headers', () => {
    const result = redactHeaders(baseEntry);
    expect(result.headers['Content-Type']).toBe('application/json');
  });

  it('accepts custom fields list', () => {
    const result = redactHeaders(baseEntry, ['content-type']);
    expect(result.headers['Content-Type']).toBe('[REDACTED]');
    expect(result.headers['Authorization']).toBe('Bearer secret');
  });

  it('returns entry unchanged if no headers present', () => {
    const entry = { method: 'GET', path: '/test' };
    expect(redactHeaders(entry)).toEqual(entry);
  });
});

describe('bucketLatency', () => {
  it('labels fast responses', () => {
    expect(bucketLatency({ responseTime: 50 }).latencyBucket).toBe('fast');
  });

  it('labels medium responses', () => {
    expect(bucketLatency({ responseTime: 300 }).latencyBucket).toBe('medium');
  });

  it('labels slow responses', () => {
    expect(bucketLatency({ responseTime: 800 }).latencyBucket).toBe('slow');
  });

  it('labels unknown when responseTime is missing', () => {
    expect(bucketLatency({}).latencyBucket).toBe('unknown');
  });
});

describe('transformEntries', () => {
  it('applies multiple transforms in order', () => {
    const entries = [{ ...baseEntry }];
    const results = transformEntries(entries, [normalizeEntry, bucketLatency]);
    expect(results[0].method).toBe('GET');
    expect(results[0].latencyBucket).toBe('medium');
  });

  it('returns entries unchanged with no transforms', () => {
    const entries = [{ method: 'GET' }];
    expect(transformEntries(entries)).toEqual(entries);
  });

  it('throws if entries is not an array', () => {
    expect(() => transformEntries(null)).toThrow('entries must be an array');
  });
});
