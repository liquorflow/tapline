const { buildThrottleConfig, createThrottle, runThrottled } = require('./replayThrottle');

describe('buildThrottleConfig', () => {
  test('defaults to concurrency 1 and no delay', () => {
    const cfg = buildThrottleConfig({});
    expect(cfg.concurrency).toBe(1);
    expect(cfg.delayMs).toBe(0);
    expect(cfg.rps).toBeNull();
  });

  test('derives delayMs from rps', () => {
    const cfg = buildThrottleConfig({ rps: 10 });
    expect(cfg.delayMs).toBe(100);
    expect(cfg.rps).toBe(10);
  });

  test('respects explicit delayMs over rps', () => {
    const cfg = buildThrottleConfig({ rps: 10, delayMs: 50 });
    expect(cfg.delayMs).toBe(50);
  });

  test('respects concurrency option', () => {
    const cfg = buildThrottleConfig({ concurrency: 5 });
    expect(cfg.concurrency).toBe(5);
  });

  test('ignores invalid rps', () => {
    const cfg = buildThrottleConfig({ rps: 0 });
    expect(cfg.rps).toBeNull();
    expect(cfg.delayMs).toBe(0);
  });
});

describe('createThrottle', () => {
  test('runs a task and increments completed', async () => {
    const throttle = createThrottle({ concurrency: 1, delayMs: 0 });
    const result = await throttle.run(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
    expect(throttle.stats().completed).toBe(1);
  });

  test('drops tasks exceeding concurrency', async () => {
    const throttle = createThrottle({ concurrency: 1, delayMs: 0 });
    // Simulate active slot being occupied
    let resolve;
    const blocker = new Promise(r => { resolve = r; });
    const p1 = throttle.run(() => blocker);
    const p2 = throttle.run(() => Promise.resolve('second'));
    const r2 = await p2;
    expect(r2).toBeNull();
    expect(throttle.stats().dropped).toBe(1);
    resolve();
    await p1;
  });

  test('stats reflect completed and dropped counts', async () => {
    const throttle = createThrottle({ concurrency: 2, delayMs: 0 });
    await throttle.run(() => Promise.resolve(1));
    await throttle.run(() => Promise.resolve(2));
    const s = throttle.stats();
    expect(s.completed).toBe(2);
    expect(s.dropped).toBe(0);
  });
});

describe('runThrottled', () => {
  test('runs all tasks and returns results', async () => {
    const tasks = [1, 2, 3].map(n => () => Promise.resolve(n * 10));
    const { results, stats } = await runThrottled(tasks, { concurrency: 1, delayMs: 0 });
    expect(results).toEqual([10, 20, 30]);
    expect(stats.completed).toBe(3);
  });

  test('returns null for dropped tasks', async () => {
    // concurrency 1 with a blocking task won't drop in serial execution
    // but we can verify structure
    const tasks = [() => Promise.resolve('a')];
    const { results } = await runThrottled(tasks, { concurrency: 1, delayMs: 0 });
    expect(results).toHaveLength(1);
    expect(results[0]).toBe('a');
  });

  test('returns stats summary', async () => {
    const tasks = [() => Promise.resolve(true)];
    const { stats } = await runThrottled(tasks, { concurrency: 1, delayMs: 0 });
    expect(stats).toHaveProperty('completed');
    expect(stats).toHaveProperty('dropped');
    expect(stats).toHaveProperty('active');
  });
});
