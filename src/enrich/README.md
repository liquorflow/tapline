# log enricher

Adds derived fields to parsed log entries for richer analysis and display.

## functions

### `enrichWithDuration(entry)`
Adds a `durationClass` field: `'fast'` (<100ms), `'medium'` (<500ms), or `'slow'` (>=500ms).

### `enrichWithHost(entry, defaultHost?)`
Ensures a `host` field is present. Falls back to `'localhost'`.

### `enrichWithTimestamp(entry)`
Parses `entry.timestamp` and adds `hour` (0–23) and `weekday` (e.g. `'Mon'`).

### `enrichWithRequestId(entry, counter)`
Assigns a sequential `requestId` like `req-1`, `req-2`, etc. Preserves existing ids.

### `enrichEntry(entry, options)`
Runs all enrichers on a single entry. Options:
- `duration` (default true)
- `host` (default true)
- `timestamp` (default true)
- `defaultHost` (string)

### `enrichEntries(entries, options)`
Maps `enrichEntry` over an array. Also applies `enrichWithRequestId` unless `options.requestId` is false.

## usage

```js
const { enrichEntries } = require('./logEnricher');
const enriched = enrichEntries(parsedEntries, { defaultHost: 'api.local' });
```
