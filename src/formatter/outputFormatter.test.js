const { formatPretty, formatTable, formatJson, formatEntries } = require('./outputFormatter');

const sampleEntries = [
  { method: 'GET', path: '/api/users', status: 200, duration: 45 },
  { method: 'POST', path: '/api/login', status: 401, duration: 12 },
  { method: 'DELETE', path: '/api/items/3', status: 500, duration: null },
];

describe('formatPretty', () => {
  it('includes method, path, and status', () => {
    const result = formatPretty(sampleEntries[0]);
    expect(result).toContain('GET');
    expect(result).toContain('/api/users');
    expect(result).toContain('200');
  });

  it('includes duration when present', () => {
    const result = formatPretty(sampleEntries[0]);
    expect(result).toContain('45ms');
  });

  it('omits duration when null', () => {
    const result = formatPretty(sampleEntries[2]);
    expect(result).not.toContain('ms)');
  });
});

describe('formatTable', () => {
  it('includes a header row', () => {
    const result = formatTable(sampleEntries);
    expect(result).toContain('METHOD');
    expect(result).toContain('PATH');
    expect(result).toContain('STATUS');
    expect(result).toContain('DURATION');
  });

  it('includes all entry methods', () => {
    const result = formatTable(sampleEntries);
    expect(result).toContain('GET');
    expect(result).toContain('POST');
    expect(result).toContain('DELETE');
  });

  it('shows N/A when duration is null', () => {
    const result = formatTable(sampleEntries);
    expect(result).toContain('N/A');
  });
});

describe('formatJson', () => {
  it('returns valid JSON string', () => {
    const result = formatJson(sampleEntries);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('preserves all entry fields', () => {
    const parsed = JSON.parse(formatJson(sampleEntries));
    expect(parsed).toHaveLength(3);
    expect(parsed[0].method).toBe('GET');
    expect(parsed[1].status).toBe(401);
  });
});

describe('formatEntries', () => {
  it('defaults to pretty mode', () => {
    const result = formatEntries(sampleEntries);
    expect(typeof result).toBe('string');
    expect(result.split('\n')).toHaveLength(sampleEntries.length);
  });

  it('uses table mode when specified', () => {
    const result = formatEntries(sampleEntries, 'table');
    expect(result).toContain('METHOD');
  });

  it('uses json mode when specified', () => {
    const result = formatEntries(sampleEntries, 'json');
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('returns a message for empty entries', () => {
    const result = formatEntries([]);
    expect(result).toContain('No log entries');
  });

  it('handles non-array input gracefully', () => {
    const result = formatEntries(null);
    expect(result).toContain('No log entries');
  });
});
