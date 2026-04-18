// budgetFormatter.js — format budget summaries for CLI output

const { summarizeBudgets, flagBudgetBreaches } = require('./logBudget');

function bar(rate, width = 20) {
  const filled = Math.round(rate * width);
  return '[' + '#'.repeat(filled) + '-'.repeat(width - filled) + ']';
}

function formatBudgetTable(entries, opts = {}) {
  const { error, latency, total } = summarizeBudgets(entries, opts);
  const lines = [
    `Budget Summary (${total} entries)`,
    '─'.repeat(50),
    `Error Budget   ${bar(1 - error.consumed)}  consumed=${(error.consumed * 100).toFixed(2)}%  ${error.breached ? '⚠ BREACHED' : '✓ OK'}`,
    `Latency Budget ${bar(1 - latency.consumed)}  consumed=${(latency.consumed * 100).toFixed(2)}%  ${latency.breached ? '⚠ BREACHED' : '✓ OK'}`,
  ];
  return lines.join('\n');
}

function formatBudgetJson(entries, opts = {}) {
  return JSON.stringify(flagBudgetBreaches(entries, opts), null, 2);
}

function formatBudgetSummary(entries, opts = {}) {
  const result = flagBudgetBreaches(entries, opts);
  if (!result.breaches.length) return 'All budgets within target.';
  return `Budget breaches detected: ${result.breaches.join(', ')}`;
}

module.exports = { formatBudgetTable, formatBudgetJson, formatBudgetSummary };
