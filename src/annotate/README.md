# annotate

Adds computed metadata fields to log entries for easier filtering, display, and analysis.

## Functions

### `tagLatency(entry)`
Adds `_latencyTier`: `'fast'` (<100ms), `'normal'` (100–499ms), `'slow'` (500–1999ms), `'critical'` (≥2000ms), or `'unknown'`.

### `tagStatusClass(entry)`
Adds `_statusClass`: `'2xx'`, `'3xx'`, `'4xx'`, `'5xx'`, or `'unknown'`.

### `tagError(entry)`
Adds `_isError`: `true` if status ≥ 400.

### `annotateEntry(entry, annotators?)`
Applies a list of annotator functions to a single entry. Defaults to all three above.

### `annotateEntries(entries, annotators?)`
Applies annotations to an array of entries.

## Usage

```js
const { annotateEntries } = require('./logAnnotator');

const annotated = annotateEntries(parsedEntries);
console.log(annotated[0]._latencyTier); // 'fast'
console.log(annotated[0]._statusClass); // '2xx'
```

Annotated fields are prefixed with `_` to distinguish them from raw log fields.
