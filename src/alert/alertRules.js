// alertRules.js — helpers for building and validating alert rule configs

const DEFAULT_RULES = [
  { name: 'high-latency', minLatency: 1000 },
  { name: 'server-error', statusGte: 500 },
  { name: 'not-found', status: 404 },
];

function buildRule(name, conditions = {}) {
  if (!name) throw new Error('Rule must have a name');
  return { name, ...conditions };
}

function validateRule(rule) {
  const errors = [];
  if (!rule.name) errors.push('missing name');
  if (rule.minLatency !== undefined && typeof rule.minLatency !== 'number')
    errors.push('minLatency must be a number');
  if (rule.maxLatency !== undefined && typeof rule.maxLatency !== 'number')
    errors.push('maxLatency must be a number');
  if (rule.status !== undefined && typeof rule.status !== 'number')
    errors.push('status must be a number');
  if (rule.statusGte !== undefined && typeof rule.statusGte !== 'number')
    errors.push('statusGte must be a number');
  return errors;
}

function loadRules(custom = []) {
  return [...DEFAULT_RULES, ...custom];
}

module.exports = { DEFAULT_RULES, buildRule, validateRule, loadRules };
