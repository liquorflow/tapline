const { replaySequential, replayConcurrent } = require('./replayScheduler');

const makeEntries = (n) =>
  Array.from({ length: n }, (_, i) => ({
    method: 'GET',
    path: `/path/${i}`,
    timestamp: new Date(Date.now() + i * 100).toISOString(),
  }));

describe('replaySequential', () => {
  test('calls replayFn once per entry and returns results in order', async () => {
    const entries = makeEntries(3);
    const fn = jest.fn(async (e) => ({ status: 200, path: e.path }));
    const results = await replaySequential(entries, fn, { delay: 0 });
    expect(fn).toHaveBeenCalledTimes(3);
    expect(results).toHaveLength(3);
    expect(results[0].path).toBe('/path/0');
  });

  test('respects delay between requests', async () => {
    const entries = makeEntries(2);
    const times = [];
    const fn = jest.fn(async () => { times.push(Date.now()); return { status: 200 }; });
    await replaySequential(entries, fn, { delay: 50 });
    expect(times[1] - times[0]).toBeGreaterThanOrEqual(40);
  });

  test('returns empty array for empty entries', async () => {
    const fn = jest.fn();
    const results = await replaySequential([], fn);
    expect(results).toEqual([]);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('replayConcurrent', () => {
  test('replays all entries and returns results', async () => {
    const entries = makeEntries(6);
    const fn = jest.fn(async (e) => ({ status: 200, path: e.path }));
    const results = await replayConcurrent(entries, fn, { concurrency: 2 });
    expect(fn).toHaveBeenCalledTimes(6);
    expect(results).toHaveLength(6);
  });

  test('processes in batches of given concurrency', async () => {
    const entries = makeEntries(5);
    let maxParallel = 0;
    let current = 0;
    const fn = jest.fn(async () => {
      current++;
      maxParallel = Math.max(maxParallel, current);
      await new Promise((r) => setTimeout(r, 10));
      current--;
      return { status: 200 };
    });
    await replayConcurrent(entries, fn, { concurrency: 3 });
    expect(maxParallel).toBeLessThanOrEqual(3);
  });
});
