// logBudget.js — track and enforce latency/error budgets across log entries

function calcErrorBudget(entries, targetRate = 0.99) {
  if (!entries.length) return { budget: targetRate, consumed: 0, remaining: targetRate, breached: false };
  const errors = entries.filter(e => e.status >= 500).length;
  const errorRate = errors / entries.length;
  const successRate = 1 - errorRate;
  const consumed = Math.max(0, targetRate - successRate);
  return {
    budget: targetRate,
    consumed: parseFloat(consumed.toFixed(4)),
    remaining: parseFloat((targetRate - consumed).toFixed(4)),
    breached: successRate < targetRate
  };
}

function calcLatencyBudget(entries, thresholdMs = 500, allowedRate = 0.95) {
  if (!entries.length) return { budget: allowedRate, consumed: 0, remaining: allowedRate, breached: false };
  const within = entries.filter(e => e.duration <= thresholdMs).length;
  const rate = within / entries.length;
  const consumed = Math.max(0, allowedRate - rate);
  return {
    budget: allowedRate,
    consumed: parseFloat(consumed.toFixed(4)),
    remaining: parseFloat((allowedRate - consumed).toFixed(4)),
    breached: rate < allowedRate
  };
}

function summarizeBudgets(entries, opts = {}) {
  const { latencyThreshold = 500, errorTarget = 0.99, latencyTarget = 0.95 } = opts;
  return {
    error: calcErrorBudget(entries, errorTarget),
    latency: calcLatencyBudget(entries, latencyThreshold, latencyTarget),
    total: entries.length
  };
}

function flagBudgetBreaches(entries, opts = {}) {
  const summary = summarizeBudgets(entries, opts);
  return {
    ...summary,
    breaches: Object.entries(summary)
      .filter(([k, v]) => k !== 'total' && v.breached)
      .map(([k]) => k)
  };
}

module.exports = { calcErrorBudget, calcLatencyBudget, summarizeBudgets, flagBudgetBreaches };
