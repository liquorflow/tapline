# tapline — Log Watcher

The `logWatcher` module provides live tail functionality for log files. It polls a file for new content and emits parsed log entries as they appear.

## Usage

```js
const { watchLog } = require('./logWatcher');

const watcher = watchLog('./access.log', (entry) => {
  console.log(entry.method, entry.path, entry.status);
});

// Stop watching later
watcher.stop();
```

## API

### `watchLog(filePath, onEntry, options?)`

| Param | Type | Description |
|---|---|---|
| `filePath` | `string` | Absolute or relative path to the log file |
| `onEntry` | `function` | Called with each new parsed log entry |
| `options.pollInterval` | `number` | Polling interval in ms (default: `500`) |

Returns an object with:
- **`stop()`** — Stops the watcher and clears the polling interval.

## Notes

- Only lines added **after** the watcher starts are emitted.
- File rotation/truncation is handled gracefully — the watcher resets its position to `0`.
- Lines that fail to parse (via `parseLine`) are silently skipped.
