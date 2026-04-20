const { createCache, makeKey } = require('./logCache');
const { formatCacheTable, formatCacheJson, formatCacheSummary } = require('./cacheFormatter');

describe('makeKey', () => {
  test('joins parts with colon', () => {
    expect(makeKey(['GET', '/api', '200'])).toBe('GET:/api:200');
  });
});

describe('createCache', () => {
  test('set and get a value', () => {
    const cache = createCache(5000);
    cache.set('foo', { data: 1 });
    expect(cache.get('foo')).toEqual({ data: 1 });
  });

  test('returns undefined for missing key', () => {
    const cache = createCache();
    expect(cache.get('nope')).toBeUndefined();
  });

  test('has() reflects presence', () => {
    const cache = createCache();
    cache.set('x', 42);
    expect(cache.has('x')).toBe(true);
    expect(cache.has('y')).toBe(false);
  });

  test('del removes a key', () => {
    const cache = createCache();
    cache.set('a', 1);
    cache.del('a');
    expect(cache.has('a')).toBe(false);
  });

  test('clear empties the cache', () => {
    const cache = createCache();
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  test('expired entries return undefined', async () => {
    const cache = createCache(10);
    cache.set('tmp', 'value');
    await new Promise(r => setTimeout(r, 20));
    expect(cache.get('tmp')).toBeUndefined();
  });

  test('evictExpired removes stale entries', async () => {
    const cache = createCache(10);
    cache.set('stale', 1);
    cache.set('stale2', 2);
    await new Promise(r => setTimeout(r, 20));
    const removed = cache.evictExpired();
    expect(removed).toBe(2);
    expect(cache.size()).toBe(0);
  });

  test('stats returns correct counts', () => {
    const cache = createCache(5000);
    cache.set('a', 1);
    cache.set('b', 2);
    const s = cache.stats();
    expect(s.active).toBe(2);
    expect(s.expired).toBe(0);
    expect(s.total).toBe(2);
  });
});

describe('cacheFormatter', () => {
  const stats = { active: 5, expired: 2, total: 7, hitRate: 0.85 };

  test('formatCacheTable returns a string with labels', () => {
    const out = formatCacheTable(stats);
    expect(out).toContain('Active entries');
    expect(out).toContain('85.0%');
  });

  test('formatCacheJson returns valid JSON', () => {
    const out = formatCacheJson(stats);
    expect(() => JSON.parse(out)).not.toThrow();
    expect(JSON.parse(out).active).toBe(5);
  });

  test('formatCacheSummary returns compact string', () => {
    const out = formatCacheSummary(stats);
    expect(out).toContain('5 active');
    expect(out).toContain('85.0%');
  });

  test('formatCacheSummary handles missing hitRate', () => {
    const out = formatCacheSummary({ active: 3, expired: 1 });
    expect(out).not.toContain('hit rate');
  });
});
