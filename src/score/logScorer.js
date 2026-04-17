// logScorer.js — score log entries by various heuristics

const DEFAULT_WEIGHTS = {
  latency: 0.4,
  status: 0.4,
  method: 0.2
};

function scoreLatency(latency) {
  if (latency == null) return 0;
  if (latency < 100) return 1.0;
  if (latency < 300) return 0.75;
  if (latency < 1000) return 0.5;
  if (latency < 3000) return 0.25;
  return 0.0;
}

function scoreStatus(status) {
  if (!status) return 0;
  if (status < 300) return 1.0;
  if (status < 400) return 0.75;
  if (status < 500) return 0.4;
  return 0.0;
}

function scoreMethod(method) {
  const safe = ['GET', 'HEAD', 'OPTIONS'];
  if (!method) return 0.5;
  return safe.includes(method.toUpperCase()) ? 1.0 : 0.7;
}

function scoreEntry(entry, weights = DEFAULT_WEIGHTS) {
  const latencyScore = scoreLatency(entry.latency) * (weights.latency || 0);
  const statusScore = scoreStatus(entry.status) * (weights.status || 0);
  const methodScore = scoreMethod(entry.method) * (weights.method || 0);
  const total = (weights.latency || 0) + (weights.status || 0) + (weights.method || 0);
  if (total === 0) return 0;
  return parseFloat(((latencyScore + statusScore + methodScore) / total).toFixed(4));
}

function scoreEntries(entries, weights = DEFAULT_WEIGHTS) {
  return entries.map(entry => ({
    ...entry,
    score: scoreEntry(entry, weights)
  }));
}

function topScored(entries, n = 10, weights = DEFAULT_WEIGHTS) {
  return scoreEntries(entries, weights)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

module.exports = { scoreLatency, scoreStatus, scoreMethod, scoreEntry, scoreEntries, topScored };
