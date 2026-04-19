'use strict';

const {
  runLengthCompress,
  stripDefaults,
  deltaEncodeDurations,
  deltaDecodeDurations,
  compressEntries,
} = require('./logCompressor');

const base = (overrides = {}) => ({
  method: 'GET',
  path: '/api/users',
  status: 200,
  duration: 100,
  timestamp: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('runLengthCompress', () => {
  test('collapses consecutive identical entries', () => {
    const entries = [base(), base(), base()];
    const result = runLengthCompress(entries);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(3);
  });

  test('keeps distinct entries separate', () => {
    const entries = [base(), base({ path: '/other' }), base()];
    const result = runLengthCompress(entries);
    expect(result).toHaveLength(3);
  });

  test('returns empty array for empty input', () => {
    expect(runLengthCompress([])).toEqual([]);
  });

  test('averages duration across collapsed entries', () => {
    const entries = [base({ duration: 100 }), base({ duration: 200 })];
    const result = runLengthCompress(entries);
    expect(result[0].duration).toBe(150);
  });
});

describe('stripDefaults', () => {
  test('removes fields matching defaults', () => {
    const entry = base();
    const result = stripDefaults(entry, { method: 'GET', status: 200 });
    expect(result.method).toBeUndefined();
    expect(result.status).toBeUndefined();
    expect(result.path).toBe('/api/users');
  });

  test('keeps fields that differ from defaults', () => {
    const entry = base({ status: 404 });
    const result = stripDefaults(entry, { status: 200 });
    expect(result.status).toBe(404);
  });
});

describe('deltaEncodeDurations / deltaDecodeDurations', () => {
  test('encodes durations as deltas', () => {
    const entries = [base({ duration: 100 }), base({ duration: 150 }), base({ duration: 120 })];
    const encoded = deltaEncodeDurations(entries);
    expect(encoded[0].duration).toBe(100);
    expect(encoded[1].duration).toBe(50);
    expect(encoded[2].duration).toBe(-30);
  });

  test('round-trips correctly', () => {
    const entries = [base({ duration: 80 }), base({ duration: 200 }), base({ duration: 150 })];
    const decoded = deltaDecodeDurations(deltaEncodeDurations(entries));
    decoded.forEach((e, i) => expect(e.duration).toBe(entries[i].duration));
  });
});

describe('compressEntries', () => {
  test('applies run-length by default', () => {
    const entries = [base(), base(), base({ path: '/other' })];
    const result = compressEntries(entries);
    expect(result[0].count).toBe(2);
    expect(result).toHaveLength(2);
  });

  test('applies delta when opted in', () => {
    const entries = [base({ duration: 100 }), base({ duration: 200 })];
    const result = compressEntries(entries, { delta: true });
    expect(result[0].duration).toBe(100);
    expect(result[1].duration).toBe(100);
  });
});
