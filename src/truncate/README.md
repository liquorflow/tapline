# tapline — truncate module

Utilities for trimming log entry arrays by count, latency, or time window.

## Functions

### `truncateHead(entries, n)`
Returns the first `n` entries.

### `truncateTail(entries, n)`
Returns the last `n` entries.

### `truncateByLatency(entries, maxMs)`
Filters out any entry whose `duration` exceeds `maxMs`. Entries missing a numeric `duration` are also removed.

### `truncateByTimeWindow(entries, startMs, endMs)`
Keeps entries whose `timestamp` (parsed via `new Date`) falls within `[startMs, endMs]` (inclusive, epoch ms).

### `truncateEntries(entries, opts)`
Dispatch helper. `opts.strategy` must be one of:

| strategy  | extra opts          |
|-----------|---------------------|
| `head`    | `n`                 |
| `tail`    | `n`                 |
| `latency` | `maxMs`             |
| `window`  | `startMs`, `endMs`  |

## Example

```js
const { truncateEntries } = require('./logTruncator');

const recent = truncateEntries(entries, { strategy: 'tail', n: 100 });
const fast   = truncateEntries(entries, { strategy: 'latency', maxMs: 300 });
```
