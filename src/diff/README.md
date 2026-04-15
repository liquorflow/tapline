# tapline — diff module

Compare two captured sessions and surface what changed between them.

## Modules

### `logDiff.js`

Core diffing logic. Works on arrays of parsed log entries.

```js
const { diffEntries, summarizeDiff } = require('./logDiff');

const diff = diffEntries(baseEntries, compareEntries);
console.log(summarizeDiff(diff));
```

**Functions**

| Function | Description |
|---|---|
| `diffEntries(base, compare)` | Returns `{ added, removed, changed }` |
| `getChangedFields(base, compare)` | Returns fields that differ between two entries |
| `summarizeDiff(diff)` | Returns a short human-readable summary string |

Entries are keyed by `method:path`. If the same endpoint appears in both sessions but with different `status`, `duration`, or `size` values it is reported as **changed**.

---

### `diffFormatter.js`

Renders a diff result for terminal output.

```js
const { formatDiff } = require('./diffFormatter');

const output = formatDiff(diff, { color: true });
console.log(output);
```

**Options**

| Option | Default | Description |
|---|---|---|
| `color` | `true` | Enable ANSI colour codes |

---

## CLI usage (planned)

```bash
tapline diff <session-a> <session-b>
tapline diff session-2024-01-10 session-2024-01-11 --no-color
```
