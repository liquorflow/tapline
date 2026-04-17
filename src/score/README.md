# logScorer

Scores HTTP log entries using configurable heuristics across latency, status code, and HTTP method.

## Functions

### `scoreEntry(entry, weights?)`
Returns a score between `0` and `1` for a single log entry.

### `scoreEntries(entries, weights?)`
Attaches a `score` field to each entry in an array.

### `topScored(entries, n?, weights?)`
Returns the top `n` entries sorted by score descending.

## Weights

Default weights:
```js
{ latency: 0.4, status: 0.4, method: 0.2 }
```

Pass custom weights to emphasize different dimensions:
```js
scoreEntries(entries, { latency: 1.0, status: 0, method: 0 });
```

## Scoring Rules

| Dimension | Criteria              | Score |
|-----------|-----------------------|-------|
| Latency   | < 100ms               | 1.0   |
| Latency   | < 300ms               | 0.75  |
| Latency   | >= 3000ms             | 0.0   |
| Status    | 2xx                   | 1.0   |
| Status    | 5xx                   | 0.0   |
| Method    | GET / HEAD / OPTIONS  | 1.0   |
| Method    | POST / PUT / etc      | 0.7   |
