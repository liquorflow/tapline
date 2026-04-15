# Export Module

The `logExporter` module allows you to export filtered or replayed log entries to various file formats for sharing, archiving, or further analysis.

## Supported Formats

| Format   | Extension | Description                          |
|----------|-----------|--------------------------------------|
| `csv`    | `.csv`    | Comma-separated, opens in spreadsheets |
| `ndjson` | `.ndjson` | Newline-delimited JSON, one entry per line |
| `text`   | `.txt`    | Human-readable plain text log lines  |

## API

### `exportEntries(entries, filePath, format)`

Exports an array of log entries to a file.

- `entries` — array of parsed log entry objects
- `filePath` — absolute or relative path for the output file
- `format` — one of `'csv'`, `'ndjson'`, `'text'` (default: `'csv'`)

Returns the resolved file path on success. Throws if entries are empty or the format is unsupported.

### `exportToCsv(entries, filePath)`
### `exportToNdjson(entries, filePath)`
### `exportToText(entries, filePath)`

Lower-level format-specific helpers. Each throws `Error('No entries to export')` when given an empty array.

## Example

```js
const { exportEntries } = require('./logExporter');
const { parseLog } = require('../parser/logParser');
const { applyFilters } = require('../filter/logFilter');

const entries = applyFilters(parseLog(rawLog), { method: 'GET', status: 200 });
exportEntries(entries, './output/session.csv', 'csv');
```

## Notes

- Field order in CSV: `method`, `path`, `status`, `duration`, `timestamp`
- NDJSON output is compatible with tools like `jq` and log aggregators
- Missing fields are exported as empty strings
