const { buildPipeline, runPipeline, runPipelineOnEntries } = require('./logPipeline');

const sampleLog = [
  'GET /api/users 200 45ms',
  'POST /api/orders 201 120ms',
  'GET /api/users 404 30ms',
  'DELETE /api/orders/1 500 200ms',
].join('\n');

const sampleEntries = [
  { method: 'GET', path: '/api/users', status: 200, duration: 45 },
  { method: 'POST', path: '/api/orders', status: 201, duration: 120 },
  { method: 'GET', path: '/api/users', status: 404, duration: 30 },
  { method: 'DELETE', path: '/api/orders/1', status: 500, duration: 200 },
];

describe('buildPipeline', () => {
  test('returns defaults when no args provided', () => {
    const p = buildPipeline({});
    expect(p.format).toBe('pretty');
).toBeNull();
    expect(p.filters.status).toBeNull();
    expect(p.transform.normalize).toBe(true);
  });

  test('maps args to pipeline config', () => {
    const p = buildPipeline({ method: 'GET', status: 200, format: 'json', redact: ['authorization'] });
    expect(p.filters.method).toBe('GET');
    expect(p.filters.status).toBe(200);
    expect(p.format).toBe('json');
    expect(p.transform.redact).toContain('authorization');
  });
});

describe('runPipeline', () => {
  test('returns a non-empty string for valid log', () => {
    const out = runPipeline(sampleLog, {});
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });

  test('filters by method', () => {
    const out = runPipeline(sampleLog, { method: 'POST', format: 'json' });
    const parsed = JSON.parse(out);
    expect(parsed.every(e => e.method === 'POST')).toBe(true);
  });

  test('returns empty result when no entries match', () => {
    const out = runPipeline(sampleLog, { method: 'PATCH', format: 'json' });
    const parsed = JSON.parse(out);
    expect(parsed).toHaveLength(0);
  });
});

describe('runPipelineOnEntries', () => {
  test('filters and formats entries', () => {
    const out = runPipelineOnEntries(sampleEntries, { status: 200, format: 'json' });
    const parsed = JSON.parse(out);
    expect(parsed.every(e => e.status === 200)).toBe(true);
  });

  test('returns all entries with no filters', () => {
    const out = runPipelineOnEntries(sampleEntries, { format: 'json' });
    const parsed = JSON.parse(out);
    expect(parsed).toHaveLength(sampleEntries.length);
  });
});
