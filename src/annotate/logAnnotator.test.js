const {
  tagLatency,
  tagStatusClass,
  tagError,
  annotateEntry,
  annotateEntries
} = require('./logAnnotator');

const base = { method: 'GET', path: '/api', status: 200, duration: 80 };

describe('tagLatency', () => {
  test('fast under 100ms', () => {
    expect(tagLatency({ ...base, duration: 50 })._latencyTier).toBe('fast');
  });
  test('normal 100-499ms', () => {
    expect(tagLatency({ ...base, duration: 300 })._latencyTier).toBe('normal');
  });
  test('slow 500-1999ms', () => {
    expect(tagLatency({ ...base, duration: 1000 })._latencyTier).toBe('slow');
  });
  test('critical 2000ms+', () => {
    expect(tagLatency({ ...base, duration: 3000 })._latencyTier).toBe('critical');
  });
  test('unknown when no duration', () => {
    expect(tagLatency({ ...base, duration: null })._latencyTier).toBe('unknown');
  });
});

describe('tagStatusClass', () => {
  test('2xx', () => {
    expect(tagStatusClass({ ...base, status: 201 })._statusClass).toBe('2xx');
  });
  test('4xx', () => {
    expect(tagStatusClass({ ...base, status: 404 })._statusClass).toBe('4xx');
  });
  test('5xx', () => {
    expect(tagStatusClass({ ...base, status: 500 })._statusClass).toBe('5xx');
  });
});

describe('tagError', () => {
  test('marks 400+ as error', () => {
    expect(tagError({ ...base, status: 400 })._isError).toBe(true);
  });
  test('does not mark 200 as error', () => {
    expect(tagError({ ...base, status: 200 })._isError).toBe(false);
  });
});

describe('annotateEntry', () => {
  test('applies all default annotators', () => {
    const result = annotateEntry(base);
    expect(result._latencyTier).toBe('fast');
    expect(result._statusClass).toBe('2xx');
    expect(result._isError).toBe(false);
  });
  test('applies custom annotators', () => {
    const result = annotateEntry(base, [tagLatency]);
    expect(result._latencyTier).toBeDefined();
    expect(result._statusClass).toBeUndefined();
  });
});

describe('annotateEntries', () => {
  test('annotates all entries', () => {
    const entries = [base, { ...base, status: 500, duration: 2500 }];
    const results = annotateEntries(entries);
    expect(results[0]._latencyTier).toBe('fast');
    expect(results[1]._latencyTier).toBe('critical');
    expect(results[1]._isError).toBe(true);
  });
});
