// outlierFormatter.js — format outlier detection results

const { summarizeOutliers } = require('./logOutlier');

function formatOutlierTable(outliers) {
  if (!outliers.length) return 'No outliers detected.\n';
  const header = ['Method', 'Path', 'Status', 'Duration(ms)'].join('\t');
  const rows = outliers.map(e =>
    [e.method, e.path, e.status, e.duration != null ? e.duration : '-'].join('\t')
  );
  return [header, ...rows].join('\n') + '\n';
}

function formatOutlierJson(outliers) {
  return JSON.stringify(outliers, null, 2) + '\n';
}

function formatOutlierSummary(outliers) {
  const s = summarizeOutliers(outliers);
  return [
    `Outliers: ${s.count}`,
    `Methods: ${s.methods.join(', ') || 'none'}`,
    `Paths: ${s.paths.slice(0, 5).join(', ')}${s.paths.length > 5 ? '...' : ''}`,
    `Max latency: ${s.maxLatency}ms`,
  ].join('\n') + '\n';
}

module.exports = { formatOutlierTable, formatOutlierJson, formatOutlierSummary };
