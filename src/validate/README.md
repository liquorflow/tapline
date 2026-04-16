# validate

Validates parsed log entries before they are processed by filters, transformers, or exporters.

## Functions

### `validateEntry(entry)`
Returns an array of error strings for a single log entry. An empty array means the entry is valid.

**Checks:**
- `method` must be a recognized HTTP verb (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- `path` must be a string starting with `/`
- `status` must be an integer between 100 and 599
- `duration` (optional) must be a non-negative number

### `validateEntries(entries)`
Validates an array of entries. Returns `{ valid, invalid }` where `invalid` items include their error list.

### `isValidEntry(entry)`
Convenience boolean check for a single entry.

## Usage

```js
const { validateEntries } = require('./logValidator');

const { valid, invalid } = validateEntries(parsedEntries);
if (invalid.length > 0) {
  console.warn(`Skipping ${invalid.length} malformed entries`);
}
```

Typically used after `parseLog` and before passing entries into the pipeline.
