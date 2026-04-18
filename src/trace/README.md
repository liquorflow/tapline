# trace

Trace HTTP request flows across log entries using shared identifiers like `requestId` or `traceId`.

## Functions

### `buildTraceMap(entries)`
Returns a `Map` keyed by trace/request ID, with arrays of matching entries.

### `traceById(entries, id)`
Filters entries matching a specific trace or request ID.

### `buildTrace(entries)`
Sorts a group of entries by timestamp to reconstruct the request flow.

### `traceSpan(entries)`
Returns `{ start, end, durationMs }` for a group of trace entries.

### `summarizeTraces(entries)`
Returns a summary array with `{ id, count, start, end, durationMs }` per trace.

### `traceEntries(entries)`
Returns an object mapping each trace ID to its sorted entries.

## Formatters

- `formatTraceTable(traces)` — ASCII table of traces
- `formatTraceJson(traces)` — JSON output
- `formatTraceSummary(traces)` — one-line summary

## Example

```js
const { traceEntries, summarizeTraces } = require('./logTracer');
const traces = traceEntries(entries);
console.log(summarizeTraces(entries));
```
