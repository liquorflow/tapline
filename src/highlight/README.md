# logHighlighter

Highlight patterns and status codes in log entries for terminal output.

## Functions

### `highlightText(text, pattern, color?)`
Highlights occurrences of `pattern` (string or RegExp) within `text`. Defaults to yellow.

```js
highlightText('GET /api/users', '/api'); // wraps /api in yellow ANSI codes
```

### `highlightEntry(entry, pattern, fields?)`
Highlights a pattern across specified fields of a log entry. Defaults to `['path', 'method']`.

```js
highlightEntry(entry, '/api', ['path']);
```

### `highlightEntries(entries, pattern, fields?)`
Applies `highlightEntry` across an array of entries.

### `highlightByStatus(entry)`
Colorizes the `status` field based on HTTP status class:
- `2xx` → green
- `3xx` → cyan
- `4xx` → yellow
- `5xx` → red

```js
highlightByStatus({ status: 404, ... });
```

## Notes
- String patterns are matched case-insensitively.
- Original entries are never mutated.
