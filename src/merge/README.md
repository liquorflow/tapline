# log merger

Merge multiple log entry arrays into a single unified stream.

## Functions

### `mergeSorted(a, b)`
Merge two entry arrays interleaved by `timestamp` (ascending).

### `mergeAll(sources)`
Merge an array of entry arrays, all sorted by timestamp.

```js
const { mergeAll } = require('./logMerger')const merged = mergeAll([entriesA, entriesB, entriesC]);
```

### `mergeUnique(sources, keyFn?)`
Merge and deduplicate entries. Default key is `method|path|timestamp`. Pass a custom `keyFn(entry)` to override.

```js
const unique = mergeUnique([entriesA, entriesB]);
```

### `tagSource(entries, label)`
Annotate each entry with a `_source` field for traceability after merging.

```js
const tagged = tagSource(entries, 'service-a.log');
```

## Use Case

Useful when combining logs from multiple microservices or log files before filtering, diffing, or replaying.
