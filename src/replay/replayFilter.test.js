const {
  filterByMethod,
  filterByStatus,
  filterByPath,
  filterByLatency,
  applyReplayFilters
} = require('./replayFilter');

const e = (overrides = {}) => ({
  method: 'GET',
  status: 200,
  path: '/api/users',
  duration: 120,
  ...overrides
});

describe('filterByMethod', () => {
  it('passes when list is empty', () => {
    expect(filterByMethod(e(), [])).toBe(true);
  });
  it('matches case-insensitively', () => {
    expect(filterByMethod(e({ method: 'POST' }), ['post'])).toBe(true);
  });
  it('rejects non-matching method', () => {
    expect(filterByMethod(e({ method: 'DELETE' }), ['GET', 'POST'])).toBe(false);
  });
});

describe('filterByStatus', () => {
  it('passes when list is empty', () => {
    expect(filterByStatus(e(), [])).toBe(true);
  });
  it('matches numeric status', () => {
    expect(filterByStatus(e({ status: 404 }), [404, 500])).toBe(true);
  });
  it('rejects non-matching status', () => {
    expect(filterByStatus(e({ status: 200 }), [500])).toBe(false);
  });
});

describe('filterByPath', () => {
  it('passes when pattern is empty', () => {
    expect(filterByPath(e(), '')).toBe(true);
  });
  it('matches via regex', () => {
    expect(filterByPath(e({ path: '/api/orders/123' }), '^/api/orders')).toBe(true);
  });
  it('falls back to prefix match on invalid regex', () => {
    expect(filterByPath(e({ path: '/api/users' }), '/api')).toBe(true);
  });
  it('rejects non-matching path', () => {
    expect(filterByPath(e({ path: '/health' }), '^/api')).toBe(false);
  });
});

describe('filterByLatency', () => {
  it('passes when maxLatency is null', () => {
    expect(filterByLatency(e({ duration: 9999 }), null)).toBe(true);
  });
  it('passes when within limit', () => {
    expect(filterByLatency(e({ duration: 100 }), 200)).toBe(true);
  });
  it('rejects when over limit', () => {
    expect(filterByLatency(e({ duration: 300 }), 200)).toBe(false);
  });
});

describe('applyReplayFilters', () => {
  const entries = [
    e({ method: 'GET',  status: 200, path: '/api/users',  duration: 80  }),
    e({ method: 'POST', status: 201, path: '/api/users',  duration: 150 }),
    e({ method: 'GET',  status: 500, path: '/api/orders', duration: 400 }),
    e({ method: 'DELETE', status: 204, path: '/api/items', duration: 60 })
  ];

  it('returns all entries with no filters', () => {
    expect(applyReplayFilters(entries, {}).length).toBe(4);
  });

  it('filters by method', () => {
    const res = applyReplayFilters(entries, { methods: ['GET'] });
    expect(res.length).toBe(2);
    expect(res.every(r => r.method === 'GET')).toBe(true);
  });

  it('filters by status', () => {
    const res = applyReplayFilters(entries, { statuses: [200, 201] });
    expect(res.length).toBe(2);
  });

  it('filters by path pattern', () => {
    const res = applyReplayFilters(entries, { pathPattern: '^/api/users' });
    expect(res.length).toBe(2);
  });

  it('filters by maxLatency', () => {
    const res = applyReplayFilters(entries, { maxLatency: 100 });
    expect(res.length).toBe(2);
  });

  it('combines multiple filters', () => {
    const res = applyReplayFilters(entries, { methods: ['GET'], maxLatency: 200 });
    expect(res.length).toBe(1);
    expect(res[0].path).toBe('/api/users');
  });
});
