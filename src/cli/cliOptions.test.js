const { parseArgs, VALID_METHODS, VALID_FORMATS } = require('./cliOptions');

describe('parseArgs', () => {
  test('returns defaults when no args provided', () => {
    const opts = parseArgs([]);
    expect(opts.method).toBeNull();
    expect(opts.status).toBeNull();
    expect(opts.path).toBeNull();
    expect(opts.format).toBe('pretty');
    expect(opts.replay).toBe(false);
    expect(opts.delay).toBe(0);
    expect(opts.help).toBe(false);
    expect(opts.file).toBeNull();
  });

  test('parses positional file argument', () => {
    const opts = parseArgs(['requests.log']);
    expect(opts.file).toBe('requests.log');
  });

  test('parses --method flag', () => {
    expect(parseArgs(['-m', 'GET']).method).toBe('GET');
    expect(parseArgs(['--method', 'post']).method).toBe('POST');
  });

  test('throws on invalid method', () => {
    expect(() => parseArgs(['-m', 'FETCH'])).toThrow('Invalid method');
  });

  test('parses --status flag', () => {
    expect(parseArgs(['-s', '404']).status).toBe(404);
    expect(parseArgs(['--status', '200']).status).toBe(200);
  });

  test('throws on invalid status code', () => {
    expect(() => parseArgs(['-s', '99'])).toThrow('Invalid status code');
    expect(() => parseArgs(['-s', 'abc'])).toThrow('Invalid status code');
  });

  test('parses --path flag', () => {
    expect(parseArgs(['-p', '/api/users']).path).toBe('/api/users');
    expect(parseArgs(['--path', '/health']).path).toBe('/health');
  });

  test('parses --format flag', () => {
    expect(parseArgs(['-f', 'json']).format).toBe('json');
    expect(parseArgs(['--format', 'TABLE']).format).toBe('table');
  });

  test('throws on invalid format', () => {
    expect(() => parseArgs(['-f', 'xml'])).toThrow('Invalid format');
  });

  test('parses --replay flag', () => {
    expect(parseArgs(['-r']).replay).toBe(true);
    expect(parseArgs(['--replay']).replay).toBe(true);
  });

  test('parses --delay flag', () => {
    expect(parseArgs(['-d', '500']).delay).toBe(500);
    expect(parseArgs(['--delay', '0']).delay).toBe(0);
  });

  test('throws on negative delay', () => {
    expect(() => parseArgs(['-d', '-100'])).toThrow('Invalid delay');
  });

  test('parses --help flag', () => {
    expect(parseArgs(['-h']).help).toBe(true);
    expect(parseArgs(['--help']).help).toBe(true);
  });

  test('parses combined flags and file', () => {
    const opts = parseArgs(['dev.log', '-m', 'POST', '-s', '201', '-f', 'json', '-r']);
    expect(opts.file).toBe('dev.log');
    expect(opts.method).toBe('POST');
    expect(opts.status).toBe(201);
    expect(opts.format).toBe('json');
    expect(opts.replay).toBe(true);
  });

  test('VALID_METHODS and VALID_FORMATS are exported', () => {
    expect(Array.isArray(VALID_METHODS)).toBe(true);
    expect(Array.isArray(VALID_FORMATS)).toBe(true);
    expect(VALID_METHODS).toContain('GET');
    expect(VALID_FORMATS).toContain('pretty');
  });
});
