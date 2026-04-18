const { pivotBy, pivotToRows, topN, pivotEntries } = require('./logPivot');
const { formatPivotTable, formatPivotJson, formatPivotSummary } = require('./pivotFormatter');

const entries = [
  { method: 'GET', status: 200, duration: 100 },
  { method: 'GET', status: 200, duration: 200 },
  { method: 'POST', status: 201, duration: 300 },
  { method: 'GET', status: 404, duration: 50 },
  { method: 'DELETE', status: 204, duration: 80 },
];

test('pivotBy groups by method', () => {
  const table = pivotBy(entries, 'method');
  expect(table['GET'].count).toBe(3);
  expect(table['POST'].count).toBe(1);
});

test('pivotBy accumulates latency', () => {
  const table = pivotBy(entries, 'method');
  expect(table['GET'].totalLatency).toBe(350);
});

test('pivotToRows returns correct avgLatency', () => {
  const table = pivotBy(entries, 'method');
  const rows = pivotToRows(table);
  const get = rows.find(r => r.key === 'GET');
  expect(get.avgLatency).toBe(117);
});

test('topN limits and sorts rows', () => {
  const table = pivotBy(entries, 'method');
  const rows = pivotToRows(table);
  const top = topN(rows, 2);
  expect(top.length).toBe(2);
  expect(top[0].key).toBe('GET');
});

test('pivotEntries with limit', () => {
  const rows = pivotEntries(entries, { field: 'method', limit: 2 });
  expect(rows.length).toBe(2);
});

test('formatPivotTable returns header', () => {
  const rows = pivotEntries(entries, { field: 'method' });
  const out = formatPivotTable(rows);
  expect(out).toContain('Key');
  expect(out).toContain('GET');
});

test('formatPivotJson is valid JSON', () => {
  const rows = pivotEntries(entries, { field: 'method' });
  const out = formatPivotJson(rows);
  expect(() => JSON.parse(out)).not.toThrow();
});

test('formatPivotSummary mentions top key', () => {
  const rows = pivotEntries(entries, { field: 'method' });
  const out = formatPivotSummary(rows);
  expect(out).toContain('GET');
});

test('handles unknown field gracefully', () => {
  const rows = pivotEntries(entries, { field: 'nonexistent' });
  expect(rows[0].key).toBe('(unknown)');
});
