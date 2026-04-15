const { parseLine, parseLog } = require('./logParser');

describe('parseLine', () => {
  test('parses a valid log line without timestamp', () => {
    const result = parseLine('GET /api/users HTTP/1.1 200 45');
    expect(result).toEqual({
      method: 'GET',
      url: '/api/users',
      httpVersion: '1.1',
      statusCode: 200,
      responseTimeMs: 45,
      timestamp: null,
    });
  });

  test('parses a valid log line with timestamp', () => {
    const result = parseLine('POST /api/login HTTP/1.1 401 12 2024-06-01T10:00:00Z');
    expect(result).toEqual({
      method: 'POST',
      url: '/api/login',
      httpVersion: '1.1',
      statusCode: 401,
      responseTimeMs: 12,
      timestamp: '2024-06-01T10:00:00Z',
    });
  });

  test('returns null for empty line', () => {
    expect(parseLine('')).toBeNull();
    expect(parseLine('   ')).toBeNull();
  });

  test('returns null for comment lines', () => {
    expect(parseLine('# this is a comment')).toBeNull();
  });

  test('returns null for malformed line', () => {
    expect(parseLine('not a valid log entry')).toBeNull();
  });

  test('normalizes method to uppercase', () => {
    const result = parseLine('get /health HTTP/1.1 200 5');
    expect(result.method).toBe('GET');
  });
});

describe('parseLog', () => {
  test('parses multiple lines', () => {
    const raw = `GET /a HTTP/1.1 200 10
POST /b HTTP/1.1 201 20`;
    const results = parseLog(raw);
    expect(results).toHaveLength(2);
    expect(results[0].url).toBe('/a');
    expect(results[1].url).toBe('/b');
  });

  test('skips blank and comment lines', () => {
    const raw = `# header comment

GET /ping HTTP/1.1 200 3
`;
    const results = parseLog(raw);
    expect(results).toHaveLength(1);
  });

  test('throws TypeError for non-string input', () => {
    expect(() => parseLog(null)).toThrow(TypeError);
    expect(() => parseLog(42)).toThrow(TypeError);
  });
});
