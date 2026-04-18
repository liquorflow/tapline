# profile

Builds performance profiles from parsed log entries.

## Functions

### `profileByPath(entries)`
Groups entries by path and computes count, avgLatency, and errorRate.

### `profileByMethod(entries)`
Same as above but grouped by HTTP method.

### `topSlowPaths(entries, n = 5)`
Returns the N paths with the highest average latency.

### `summarizeProfile(entries)`
Returns a full summary object including overall stats, per-method breakdown, and top slow paths.

## Formatters

### `formatProfileTable(profiles, field)`
Renders a plain-text table of profile rows.

### `formatProfileJson(summary)`
Returns the summary as pretty-printed JSON.

### `formatProfileSummary(summary)`
Returns a human-readable summary string.

## Example

```js
const { summarizeProfile } = require('./logProfiler');
const { formatProfileSummary } = require('./profileFormatter');

const summary = summarizeProfile(entries);
console.log(formatProfileSummary(summary));
```
