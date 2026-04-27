// topologyFormatter.js — format topology rows for display

const { topologyToRows, summarizeTopology } = require('./logTopology');

function formatTopologyTable(map) {
  const rows = topologyToRows(map);
  if (!rows.length) return 'No topology data.';
  const header = ['FROM', 'TO', 'METHOD', 'PATH', 'CALLS', 'AVG_MS', 'ERRORS', 'ERR_RATE'];
  const lines = [header.join('\t')];
  for (const r of rows) {
    lines.push(
      [r.from, r.to, r.method, r.path, r.count, r.avgLatency, r.errors, r.errorRate].join('\t')
    );
  }
  return lines.join('\n');
}

function formatTopologyJson(map) {
  return JSON.stringify(topologyToRows(map), null, 2);
}

function formatTopologySummary(map) {
  const { totalEdges, totalCalls, hottest } = summarizeTopology(map);
  const lines = [
    `Edges   : ${totalEdges}`,
    `Calls   : ${totalCalls}`
  ];
  if (hottest) {
    lines.push(
      `Hottest : ${hottest.from} -> ${hottest.to} ${hottest.method} ${hottest.path} (${hottest.count} calls, ${hottest.avgLatency}ms avg)`
    );
  }
  return lines.join('\n');
}

function formatTopology(map, fmt = 'table') {
  if (fmt === 'json') return formatTopologyJson(map);
  if (fmt === 'summary') return formatTopologySummary(map);
  return formatTopologyTable(map);
}

module.exports = { formatTopologyTable, formatTopologyJson, formatTopologySummary, formatTopology };
