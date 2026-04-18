const { formatBudgetTable, formatBudgetJson, formatBudgetSummary } = require('./budgetFormatter');

const ok = (status, duration) => ({ status, duration });

describe('formatBudgetTable', () => {
  test('returns string with budget info', () => {
    const entries = [ok(200, 100), ok(500, 800)];
    const out = formatBudgetTable(entries);
    expect(typeof out).toBe('string');
    expect(out).toMatch(/Budget Summary/);
    expect(out).toMatch(/Error Budget/);
    expect(out).toMatch(/Latency Budget/);
  });

  test('shows BREACHED when budget exceeded', () => {
    const entries = Array(10).fill(ok(500, 2000));
    const out = formatBudgetTable(entries);
    expect(out).toMatch(/BREACHED/);
  });
});

describe('formatBudgetJson', () => {
  test('returns valid JSON', () => {
    const entries = [ok(200, 100)];
    const out = formatBudgetJson(entries);
    expect(() => JSON.parse(out)).not.toThrow();
    const parsed = JSON.parse(out);
    expect(parsed).toHaveProperty('error');
    expect(parsed).toHaveProperty('latency');
  });
});

describe('formatBudgetSummary', () => {
  test('all good message', () => {
    const entries = [ok(200, 50)];
    expect(formatBudgetSummary(entries)).toMatch(/within target/);
  });

  test('breach message lists types', () => {
    const entries = Array(20).fill(ok(500, 2000));
    const out = formatBudgetSummary(entries);
    expect(out).toMatch(/breaches detected/);
  });
});
