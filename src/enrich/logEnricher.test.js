const {
  enrichWithDuration,
  enrichWithHost,
  enrichWithTimestamp,
  enrichWithRequestId,
  enrichEntry,
  enrichEntries
} = require('./logEnricher');

const base = { method: 'GET', path: '/api', status: 200, latency: 250, timestamp: '2024-03-01T10:30:00Z' };

test('enrichWithDuration tags fast', () => {
  const e = enrichWithDuration({ ...base, latency: 50 });
  expect(e.durationClass).toBe('fast');
});

test('enrichWithDuration tags medium', () => {
  const e = enrichWithDuration({ ...base, latency: 300 });
  expect(e.durationClass).toBe('medium');
});

test('enrichWithDuration tags slow', () => {
  const e = enrichWithDuration({ ...base, latency: 800 });
  expect(e.durationClass).toBe('slow');
});

test('enrichWithDuration skips if no latency', () => {
  const e = enrichWithDuration({ method: 'GET' });
  expect(e.durationClass).toBeUndefined();
});

test('enrichWithHost uses existing host', () => {
  const e = enrichWithHost({ ...base, host: 'example.com' });
  expect(e.host).toBe('example.com');
});

test('enrichWithHost uses default', () => {
  const e = enrichWithHost(base);
  expect(e.host).toBe('localhost');
});

test('enrichWithTimestamp adds hour and weekday', () => {
  const e = enrichWithTimestamp(base);
  expect(typeof e.hour).toBe('number');
  expect(typeof e.weekday).toBe('string');
});

test('enrichWithTimestamp skips bad timestamp', () => {
  const e = enrichWithTimestamp({ timestamp: 'bad' });
  expect(e.hour).toBeUndefined();
});

test('enrichWithRequestId assigns sequential ids', () => {
  const counter = { n: 0 };
  const a = enrichWithRequestId({}, counter);
  const b = enrichWithRequestId({}, counter);
  expect(a.requestId).toBe('req-1');
  expect(b.requestId).toBe('req-2');
});

test('enrichWithRequestId keeps existing id', () => {
  const e = enrichWithRequestId({ requestId: 'abc' }, { n: 0 });
  expect(e.requestId).toBe('abc');
});

test('enrichEntries processes all entries', () => {
  const entries = [base, { ...base, latency: 50 }];
  const result = enrichEntries(entries);
  expect(result).toHaveLength(2);
  expect(result[0].requestId).toBe('req-1');
  expect(result[1].requestId).toBe('req-2');
  expect(result[1].durationClass).toBe('fast');
});

test('enrichEntry respects options flags', () => {
  const e = enrichEntry(base, { duration: false, timestamp: false });
  expect(e.durationClass).toBeUndefined();
  expect(e.hour).toBeUndefined();
  expect(e.host).toBe('localhost');
});
