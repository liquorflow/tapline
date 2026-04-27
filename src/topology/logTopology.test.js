const { toEdge, buildTopology, topologyToRows, summarizeTopology } = require('./logTopology');
const { formatTopologyTable, formatTopologyJson, formatTopologySummary, formatTopology } = require('./topologyFormatter');

const entries = [
  { source: 'svc-a', host: 'svc-b', method: 'GET',  path: '/api/users',  status: 200, duration: 120 },
  { source: 'svc-a', host: 'svc-b', method: 'GET',  path: '/api/users',  status: 200, duration: 80  },
  { source: 'svc-a', host: 'svc-b', method: 'POST', path: '/api/orders', status: 500, duration: 300 },
  { source: 'svc-c', host: 'svc-b', method: 'GET',  path: '/api/users',  status: 200, duration: 60  },
];

describe('toEdge', () => {
  test('uses source and host fields', () => {
    const edge = toEdge(entries[0]);
    expect(edge.from).toBe('svc-a');
    expect(edge.to).toBe('svc-b');
    expect(edge.method).toBe('GET');
    expect(edge.path).toBe('/api/users');
  });

  test('falls back to client/server when missing', () => {
    const edge = toEdge({ method: 'GET', path: '/x', status: 200 });
    expect(edge.from).toBe('client');
    expect(edge.to).toBe('server');
  });
});

describe('buildTopology', () => {
  test('aggregates counts correctly', () => {
    const map = buildTopology(entries);
    expect(map.size).toBe(3);
  });

  test('counts calls per edge', () => {
    const map = buildTopology(entries);
    const rows = topologyToRows(map);
    const top = rows.find(r => r.path === '/api/users' && r.from === 'svc-a');
    expect(top.count).toBe(2);
    expect(top.avgLatency).toBe(100);
  });

  test('tracks errors', () => {
    const map = buildTopology(entries);
    const rows = topologyToRows(map);
    const errRow = rows.find(r => r.path === '/api/orders');
    expect(errRow.errors).toBe(1);
    expect(errRow.errorRate).toBe(1);
  });
});

describe('topologyToRows', () => {
  test('returns sorted by count desc', () => {
    const map = buildTopology(entries);
    const rows = topologyToRows(map);
    expect(rows[0].count).toBeGreaterThanOrEqual(rows[1].count);
  });
});

describe('summarizeTopology', () => {
  test('returns correct totals', () => {
    const map = buildTopology(entries);
    const s = summarizeTopology(map);
    expect(s.totalEdges).toBe(3);
    expect(s.totalCalls).toBe(4);
    expect(s.hottest).not.toBeNull();
  });

  test('handles empty input', () => {
    const map = buildTopology([]);
    const s = summarizeTopology(map);
    expect(s.totalEdges).toBe(0);
    expect(s.hottest).toBeNull();
  });
});

describe('formatTopology', () => {
  test('table output contains headers', () => {
    const map = buildTopology(entries);
    const out = formatTopologyTable(map);
    expect(out).toContain('FROM');
    expect(out).toContain('/api/users');
  });

  test('json output is valid JSON', () => {
    const map = buildTopology(entries);
    const out = formatTopologyJson(map);
    expect(() => JSON.parse(out)).not.toThrow();
  });

  test('summary output contains Edges and Calls', () => {
    const map = buildTopology(entries);
    const out = formatTopologySummary(map);
    expect(out).toContain('Edges');
    expect(out).toContain('Calls');
  });

  test('formatTopology dispatches by fmt', () => {
    const map = buildTopology(entries);
    expect(formatTopology(map, 'json')).toContain('[');
    expect(formatTopology(map, 'summary')).toContain('Hottest');
    expect(formatTopology(map, 'table')).toContain('FROM');
  });
});
