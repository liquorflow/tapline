# logGrouper

Group log entries by a field or latency bucket.

## Functions

### `groupBy(entries, field)`
Groups entries by any top-level field (e.g. `method`, `status`, `path`).
Returns an object mapping each unique value to an array of matching entries.

### `groupByLatency(entries, thresholds?)`
Buckets entries into `fast`, `medium`, and `slow` based on `duration` (ms).

Default thresholds:
```js
{ fast: 200, medium: 1000 }
```

### `summarizeGroups(groups)`
Converts a group map into a count summary:
```js
{ GET: 12, POST: 4, DELETE: 1 }
```

### `groupEntries(entries, by, options?)`
Convenience wrapper. Supports:
- `'method'`, `'status'`, `'path'` — delegates to `groupBy`
- `'latency'` — delegates to `groupByLatency`

## Example

```js
const { groupEntries, summarizeGroups } = require('./logGrouper');

const groups = groupEntries(entries, 'status');
console.log(summarizeGroups(groups));
// { '200': 42, '404': 5, '500': 1 }
```
