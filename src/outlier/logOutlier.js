// logOutlier.js — detect statistical outliers in log entries

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values, avg) {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function detectLatencyOutliers(entries, threshold = 2) {
  const latencies = entries.map(e => e.duration).filter(d => typeof d === 'number');
  const avg = mean(latencies);
  const sd = stddev(latencies, avg);
  return entries.filter(e => typeof e.duration === 'number' && Math.abs(e.duration - avg) > threshold * sd);
}

function detectStatusOutliers(entries) {
  const statusCounts = {};
  for (const e of entries) {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
  }
  const total = entries.length;
  const rare = Object.entries(statusCounts)
    .filter(([, count]) => count / total < 0.02)
    .map(([status]) => Number(status));
  return entries.filter(e => rare.includes(e.status));
}

function scoreOutlier(entry, avg, sd) {
  if (!sd || typeof entry.duration !== 'number') return 0;
  return Math.abs(entry.duration - avg) / sd;
}

function summarizeOutliers(outliers) {
  return {
    count: outliers.length,
    methods: [...new Set(outliers.map(e => e.method))],
    paths: [...new Set(outliers.map(e => e.path))],
    maxLatency: outliers.length ? Math.max(...outliers.map(e => e.duration || 0)) : 0,
  };
}

function detectOutliers(entries, options = {}) {
  const { latencyThreshold = 2, includeStatusOutliers = false } = options;
  const latency = detectLatencyOutliers(entries, latencyThreshold);
  if (!includeStatusOutliers) return latency;
  const status = detectStatusOutliers(entries);
  const combined = [...new Set([...latency, ...status])];
  return combined;
}

module.exports = { mean, stddev, detectLatencyOutliers, detectStatusOutliers, scoreOutlier, summarizeOutliers, detectOutliers };
