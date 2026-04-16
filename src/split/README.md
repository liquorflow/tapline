# logSplitter

Split log entry arrays into chunks, partitions, or field-based groups.

## Functions

### `chunkEntries(entries, size)`
Split entries into sequential chunks of `size`.

### `partitionEntries(entries, n)`
Split entries into `n` roughly equal partitions.

### `splitByField(entries, field)`
Group entries into a map keyed by the value of `field`.

```js
const groups = splitByField(entries, 'method');
// { GET: [...], POST: [...] }
```

### `splitAt(entries, index)`
Split entries at `index` into `[before, after]`.

### `splitEntries(entries, options)`
High-level dispatcher.

| option | values |
|--------|--------|
| `mode` | `'chunk'`, `'partition'`, `'field'`, `'at'` |
| `size` | chunk size (chunk mode) |
| `n` | partition count (partition mode) |
| `field` | field name (field mode) |
| `index` | split index (at mode) |

## Example

```js
const { splitEntries } = require('./logSplitter');
const chunks = splitEntries(entries, { mode: 'chunk', size: 100 });
```
