const { calcErrorBudget, calcLatencyBudget, summarizeBudgets, flagBudgetBreaches } = require('./logBudget');

const ok = (status, duration) => ({ status, duration });

describe('calcErrorBudget', () => {
  test('no entries returns full budget', () => {
    const r = calcErrorBudget([]);
    expect(r.breached).toBe(false);
    expect(r.consumed).toBe(0);
  });

  test('all success does not breach', () => {
    const entries = [ok(200, 100), ok(201, 50), ok(204, 80)];
    const r = calcErrorBudget(entries, 0.99);
    expect(r.breached).toBe(false);
  });

  test('high error rate breaches budget', () => {
    const entries = [ok(500, 10), ok(500, 10), ok(200, 10)];
    const r = calcErrorBudget(entries, 0.99);
    expect(r.breached).toBe(true);
    expect(r.consumed).toBeGreaterThan(0);
  });
});

describe('calcLatencyBudget', () => {
  test('all fast does not breach', () => {
    const entries = [ok(200, 100), ok(200, 200)];
    const r = calcLatencyBudget(entries, 500, 0.95);
    expect(r.breached).toBe(false);
  });

  test('mostly slow breaches budget', () => {
    const entries = Array(20).fill(ok(200, 1000)).concat([ok(200, 100)]);
    const r = calcLatencyBudget(entries, 500, 0.95);
    expect(r.breached).toBe(true);
  });
});

describe('summarizeBudgets', () => {
  test('returns error and latency summaries', () => {
    const entries = [ok(200, 100), ok(500, 600)];
    const s = summarizeBudgets(entries);
    expect(s).toHaveProperty('error');
    expect(s).toHaveProperty('latency');
    expect(s.total).toBe(2);
  });
});

describe('flagBudgetBreaches', () => {
  test('lists breached budget names', () => {
    const entries = Array(10).fill(ok(500, 1000));
    const r = flagBudgetBreaches(entries);
    expect(r.breaches).toContain('error');
    expect(r.breaches).toContain('latency');
  });

  test('empty breaches when all good', () => {
    const entries = [ok(200, 50)];
    const r = flagBudgetBreaches(entries);
    expect(r.breaches).toHaveLength(0);
  });
});
