const { checkQuota, quotaByPath, quotaByMethod, quotaByIp, summarizeQuotas, applyQuota } = require('./logQuota');
const { formatQuotaTable, formatQuotaJson, formatQuotaSummary } = require('./quotaFormatter');

const entries = [
  { method: 'GET', path: '/api/users', ip: '1.1.1.1' },
  { method: 'GET', path: '/api/users', ip: '1.1.1.1' },
  { method: 'GET', path: '/api/users', ip: '2.2.2.2' },
  { method: 'POST', path: '/api/orders', ip: '1.1.1.1' },
  { method: 'POST', path: '/api/orders', ip: '3.3.3.3' },
];

test('quotaByPath counts per path', () => {
  const r = quotaByPath(entries, 2);
  const users = r.find(x => x.key === '/api/users');
  expect(users.count).toBe(3);
  expect(users.exceeded).toBe(true);
  const orders = r.find(x => x.key === '/api/orders');
  expect(orders.count).toBe(2);
  expect(orders.exceeded).toBe(false);
});

test('quotaByMethod counts per method', () => {
  const r = quotaByMethod(entries, 3);
  const get = r.find(x => x.key === 'GET');
  expect(get.count).toBe(3);
  expect(get.exceeded).toBe(false);
});

test('quotaByIp counts per ip', () => {
  const r = quotaByIp(entries, 2);
  const ip1 = r.find(x => x.key === '1.1.1.1');
  expect(ip1.count).toBe(3);
  expect(ip1.exceeded).toBe(true);
});

test('summarizeQuotas returns correct counts', () => {
  const r = quotaByPath(entries, 2);
  const s = summarizeQuotas(r);
  expect(s.total).toBe(2);
  expect(s.exceeded).toBe(1);
  expect(s.ok).toBe(1);
  expect(s.breaches[0].key).toBe('/api/users');
});

test('applyQuota defaults to path', () => {
  const r = applyQuota(entries, { limit: 2 });
  expect(r.some(x => x.key === '/api/users')).toBe(true);
});

test('formatQuotaTable returns string', () => {
  const r = quotaByPath(entries, 2);
  const out = formatQuotaTable(r);
  expect(typeof out).toBe('string');
  expect(out).toContain('/api/users');
  expect(out).toContain('EXCEEDED');
});

test('formatQuotaJson is valid json', () => {
  const r = quotaByPath(entries, 2);
  const out = formatQuotaJson(r);
  expect(() => JSON.parse(out)).not.toThrow();
});

test('formatQuotaSummary includes breach info', () => {
  const r = quotaByPath(entries, 2);
  const s = summarizeQuotas(r);
  const out = formatQuotaSummary(s);
  expect(out).toContain('Exceeded');
  expect(out).toContain('/api/users');
});
