// logSummary.js — high-level summary of a parsed log dataset

'use strict';

const { countByMethod, countByStatus, latencyStats } = require('../stats/logStats');
const { detectLatencyOutliers } = require('../outlier/logOutlier');
const { flagBudgetBreaches } = require('../budget/logBudget');

/**
 * Build a top-level summary object from a list of log entries.
 * @param {object[]} entries
 * @param {object} [opts]
 * @param {number} [opts.latencySla=1000] - latency SLA in ms
 * @param {number} [opts.errorBudget=0.05] - allowed error rate (0–1)
 * @returns {object}
 */
function buildSummary(entries, opts = {}) {
  const { latencySla = 1000, errorBudget = 0.05 } = opts;

  if (!entries || entries.length === 0) {
    return { total: 0, methods: {}, statuses: {}, latency: null, outliers: 0, budgetBreaches: [] };
  }

  const methods = countByMethod(entries);
  const statuses = countByStatus(entries);
  const latency = latencyStats(entries);

  const outliers = detectLatencyOutliers(entries);
  const budgetBreaches = flagBudgetBreaches(entries, { latencySla, errorBudget });

  const errorCount = entries.filter(e => e.status >= 500).length;
  const errorRate = errorCount / entries.length;

  return {
    total: entries.length,
    methods,
    statuses,
    latency,
    outlierCount: outliers.length,
    errorRate: parseFloat(errorRate.toFixed(4)),
    budgetBreaches,
  };
}

/**
 * Return a short one-line text summary.
 * @param {object} summary
 * @returns {string}
 */
function oneLiner(summary) {
  if (summary.total === 0) return 'No entries.';
  const { total, latency, errorRate, outlierCount } = summary;
  const p50 = latency ? latency.p50 : 'n/a';
  const p99 = latency ? latency.p99 : 'n/a';
  return `${total} requests | p50=${p50}ms p99=${p99}ms | errors=${(errorRate * 100).toFixed(1)}% | outliers=${outlierCount}`;
}

module.exports = { buildSummary, oneLiner };
