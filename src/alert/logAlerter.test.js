const { matchesAlert, checkAlerts, summarizeAlerts, formatAlerts } = require('./logAlerter');

const e = (method, path, status, duration) => ({ method, path, status, duration });

describe('matchesAlert', () => {
  test('matches by minLatency', () => {
    expect(matchesAlert(e('GET', '/a', 200, 1500), { minLatency: 1000 })).toBe(true);
    expect(matchesAlert(e('GET', '/a', 200, 500), { minLatency: 1000 })).toBe(false);
  });
  test('matches by status', () => {
    expect(matchesAlert(e('GET', '/a', 404, 10), { status: 404 })).toBe(true);
    expect(matchesAlert(e('GET', '/a', 200, 10), { status: 404 })).toBe(false);
  });
  test('matches by statusGte', () => {
    expect(matchesAlert(e('GET', '/a', 500, 10), { statusGte: 500 })).toBe(true);
    expect(matchesAlert(e('GET', '/a', 200, 10), { statusGte: 500 })).toBe(false);
  });
  test('matches by pathPrefix', () => {
    expect(matchesAlert(e('GET', '/api/x', 200, 10), { pathPrefix: '/api' })).toBe(true);
    expect(matchesAlert(e('GET', '/other', 200, 10), { pathPrefix: '/api' })).toBe(false);
  });
  test('matches by method', () => {
    expect(matchesAlert(e('POST', '/a', 200, 10), { method: 'POST' })).toBe(true);
    expect(matchesAlert(e('GET', '/a', 200, 10), { method: 'POST' })).toBe(false);
  });
});

describe('checkAlerts', () => {
  test('returns triggered alerts', () => {
    const entries = [e('GET', '/a', 500, 20), e('GET', '/b', 200, 10)];
    const rules = [{ name: 'err', statusGte: 500 }];
    const result = checkAlerts(entries, rules);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('err');
  });
  test('returns empty if no matches', () => {
    const entries = [e('GET', '/a', 200, 10)];
    expect(checkAlerts(entries, [{ name: 'x', status: 404 }])).toHaveLength(0);
  });
});

describe('summarizeAlerts', () => {
  test('counts by rule name', () => {
    const triggered = [
      { rule: 'err', entry: {} },
      { rule: 'err', entry: {} },
      { rule: 'slow', entry: {} },
    ];
    expect(summarizeAlerts(triggered)).toEqual({ err: 2, slow: 1 });
  });
});

describe('formatAlerts', () => {
  test('returns no alerts message when empty', () => {
    expect(formatAlerts([])).toBe('No alerts triggered.');
  });
  test('formats triggered alerts', () => {
    const triggered = [{ rule: 'slow', entry: e('GET', '/x', 200, 2000) }];
    expect(formatAlerts(triggered)).toContain('[ALERT:slow]');
  });
});
