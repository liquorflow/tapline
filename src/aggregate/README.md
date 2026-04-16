# aggregate

Aggregate log entries by a given field and compute metrics per group.

## Functions

### `aggregateByMethod(entries)`
Groups entries by HTTP method, returning count, avg latency, and status distribution.

### `aggregateByPath(entries)`
Groups entries by request path.

### `aggregateByStatus(entries)`
Groups entries by status code.

### `aggregateEntries(entries, field)`
Generic aggregation by any entry field.

## Formatter

### `formatAggregateTable(rows)`
Returns a tab-separated table string.

### `formatAggregateJson(rows)`
Returns pretty-printed JSON.

### `formatAggregateSummary(rows)`
Returns a short summary with total count and top key.

## Example

```js
const { aggregateByMethod } = require('./logAggregator');
const { formatAggregateTable } = require('./aggregateFormatter');

const rows = aggregateByMethod(entries);
console.log(formatAggregateTable(rows));
```
