const {
  classifyLatency,
  classifyStatus,
  classifyMethod,
  classifyEntry,
  classifyEntries,
  DEFAULT_CLASSIFIERS,
} = require('./logClassifier');

const entry = (overrides = {}) => ({
  method: 'GET',
  path: '/api/test',
  status: 200,
  duration: 120,
  ...overrides,
});

describe('classifyLatency', () => {
  test('fast under 100ms', () => {
    expect(classifyLatency(entry({ duration: 50 }))).toBe('fast');
  });
  test('normal 100-499ms', () => {
    expect(classifyLatency(entry({ duration: 300 }))).toBe('normal');
  });
  test('slow 500-1999ms', () => {
    expect(classifyLatency(entry({ duration: 1200 }))).toBe('slow');
  });
  test('critical 2000ms+', () => {
    expect(classifyLatency(entry({ duration: 3000 }))).toBe('critical');
  });
  test('defaults to 0 when no duration field', () => {
    expect(classifyLatency({})).toBe('fast');
  });
});

describe('classifyStatus', () => {
  test('success for 2xx', () => {
    expect(classifyStatus(entry({ status: 200 }))).toBe('success');
    expect(classifyStatus(entry({ status: 201 }))).toBe('success');
  });
  test('redirect for 3xx', () => {
    expect(classifyStatus(entry({ status: 301 }))).toBe('redirect');
  });
  test('client-error for 4xx', () => {
    expect(classifyStatus(entry({ status: 404 }))).toBe('client-error');
  });
  test('server-error for 5xx', () => {
    expect(classifyStatus(entry({ status: 503 }))).toBe('server-error');
  });
  test('unknown for missing status', () => {
    expect(classifyStatus({})).toBe('unknown');
  });
});

describe('classifyMethod', () => {
  test('safe for GET/HEAD/OPTIONS', () => {
    expect(classifyMethod(entry({ method: 'GET' }))).toBe('safe');
    expect(classifyMethod(entry({ method: 'HEAD' }))).toBe('safe');
    expect(classifyMethod(entry({ method: 'OPTIONS' }))).toBe('safe');
  });
  test('idempotent for PUT/DELETE/PATCH', () => {
    expect(classifyMethod(entry({ method: 'PUT' }))).toBe('idempotent');
    expect(classifyMethod(entry({ method: 'DELETE' }))).toBe('idempotent');
  });
  test('unsafe for POST', () => {
    expect(classifyMethod(entry({ method: 'POST' }))).toBe('unsafe');
  });
  test('unknown for unrecognised method', () => {
    expect(classifyMethod(entry({ method: 'BREW' }))).toBe('unknown');
  });
});

describe('classifyEntry', () => {
  test('applies all classifiers and returns label map', () => {
    const result = classifyEntry(entry({ duration: 50, status: 200, method: 'GET' }), DEFAULT_CLASSIFIERS);
    expect(result).toEqual({ latency: 'fast', status: 'success', method: 'safe' });
  });
});

describe('classifyEntries', () => {
  test('attaches _classes to each entry', () => {
    const entries = [
      entry({ duration: 600, status: 500, method: 'POST' }),
      entry({ duration: 80, status: 200, method: 'GET' }),
    ];
    const result = classifyEntries(entries, DEFAULT_CLASSIFIERS);
    expect(result[0]._classes).toEqual({ latency: 'slow', status: 'server-error', method: 'unsafe' });
    expect(result[1]._classes).toEqual({ latency: 'fast', status: 'success', method: 'safe' });
  });
  test('does not mutate original entries', () => {
    const e = entry();
    classifyEntries([e], DEFAULT_CLASSIFIERS);
    expect(e._classes).toBeUndefined();
  });
});
