# logCompressor

Utilities for compressing arrays of log entries to reduce memory footprint and output verbosity.

## Functions

### `runLengthCompress(entries)`
Collapses consecutive entries that share the same `method`, `path`, and `status` into a single entry with a `count` field. Durations are averaged.

### `stripDefaults(entry, defaults)`
Removes fields from an entry whose values match the provided defaults map. Useful for trimming noise from high-volume logs.

### `deltaEncodeDurations(entries)`
Replaces absolute `duration` values with deltas relative to the previous entry. Reduces numeric range for serialization.

### `deltaDecodeDurations(entries)`
Restores delta-encoded durations back to absolute values.

### `compressEntries(entries, opts)`
High-level helper that chains compression steps based on options:

| Option | Effect |
|---|---|
| `delta` | Apply delta encoding to durations |
| `defaults` | Strip fields matching the given defaults map |

## Example

```js
const { compressEntries } = require('./logCompressor');

const compressed = compressEntries(entries, {
  delta: true,
  defaults: { method: 'GET', status: 200 },
});
```
