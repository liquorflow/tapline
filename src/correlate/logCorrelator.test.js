const {
  byRequestId,
  bySessionId,
  correlateByProximity,
  summarizeCorrelations,
  correlateEntries,
} = require('./logCorrelator');

const entries = [
  { method: 'GET', path: '/a', status: 200, duration: 100, timestamp: '2024-01-01T00:00:00.000Z', requestId: 'r1', sessionId: 's1' },
  { method: 'POST', path: '/b', status: 201, duration: 200, timestamp: '2024-01-01T00:00:00.200Z', requestId: 'r1', sessionId: 's1' },
  { method: 'GET', path: '/c', status: 500, duration: 300, timestamp: '2024-01-01T00:01:00.000Z', requestId: 'r2', sessionId: 's2' },
];

test('byRequestId groups correctly', () => {
  const g = byRequestId(entries);
  expect(g['r1']).toHaveLength(2);
  expect(g['r2']).toHaveLength(1);
});

test('bySessionId groups correctly', () => {
  const g = bySessionId(entries);
  expect(g['s1']).toHaveLength(2);
  expect(g['s2']).toHaveLength(1);
});

test('correlateByProximity chains close entries', () => {
  const chains = correlateByProximity(entries, 500);
  expect(chains[0]).toHaveLength(2);
  expect(chains[1]).toHaveLength(1);
});

test('summarizeCorrelations returns correct shape', () => {
  const g = byRequestId(entries);
  const summary = summarizeCorrelations(g);
  const r1 = summary.find(s => s.id === 'r1');
  expect(r1.count).toBe(2);
  expect(r1.totalLatency).toBe(300);
  expect(r1.statuses).toContain(200);
});

test('correlateEntries defaults to requestId mode', () => {
  const g = correlateEntries(entries);
  expect(Object.keys(g)).toContain('r1');
});

test('correlateEntries proximity mode', () => {
  const g = correlateEntries(entries, { mode: 'proximity', windowMs: 500 });
  expect(Object.keys(g)).toContain('chain_0');
  expect(g['chain_0']).toHaveLength(2);
});

test('skips entries without requestId', () => {
  const g = byRequestId([{ method: 'GET', path: '/x', status: 200 }]);
  expect(Object.keys(g)).toHaveLength(0);
});
