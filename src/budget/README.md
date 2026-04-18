# Budget Module

Track and enforce latency and error budgets across HTTP log entries.

## Functions

### `calcErrorBudget(entries, targetRate?)`
Calculates how much of the error budget has been consumed.
- `targetRate` — desired success rate (default `0.99`)
- Returns `{ budget, consumed, remaining, breached }`

### `calcLatencyBudget(entries, thresholdMs?, allowedRate?)`
Calculates how much of the latency budget has been consumed.
- `thresholdMs` — max acceptable latency in ms (default `500`)
- `allowedRate` — fraction of requests that must be within threshold (default `0.95`)
- Returns `{ budget, consumed, remaining, breached }`

### `summarizeBudgets(entries, opts?)`
Returns both error and latency budget summaries plus total entry count.

### `flagBudgetBreaches(entries, opts?)`
Extends `summarizeBudgets` with a `breaches` array listing which budgets were exceeded.

## Formatter

```js
const { formatBudgetTable, formatBudgetJson, formatBudgetSummary } = require('./budgetFormatter');
```

- `formatBudgetTable(entries, opts?)` — CLI-friendly table with progress bars
- `formatBudgetJson(entries, opts?)` — JSON output
- `formatBudgetSummary(entries, opts?)` — one-line summary

## Options

| Option | Default | Description |
|---|---|---|
| `errorTarget` | `0.99` | Required success rate |
| `latencyTarget` | `0.95` | Required fraction within threshold |
| `latencyThreshold` | `500` | Latency threshold in ms |
