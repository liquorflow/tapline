# tapline / storage

Manages **named replay sessions** — saving, loading, listing, and deleting sets of parsed log entries to disk.

## Modules

### `sessionStore.js`
Low-level file I/O. Sessions are stored as JSON files in `~/.tapline/sessions/`.

| Function | Description |
|---|---|
| `saveSession(name, entries, [dir])` | Persists entries to `<dir>/<name>.json` |
| `loadSession(name, [dir])` | Reads and parses a session file |
| `listSessions([dir])` | Returns an array of session names |
| `deleteSession(name, [dir])` | Removes a session file |
| `ensureStoreDir([dir])` | Creates the store directory if missing |

### `sessionManager.js`
High-level wrapper used by the CLI. Returns structured `{ success, message, ... }` objects.

| Function | Description |
|---|---|
| `save(name, entries)` | Validate + save a session |
| `load(name)` | Load a session by name |
| `list()` | List all saved sessions |
| `remove(name)` | Delete a session by name |

## Session file format

```json
{
  "name": "my-session",
  "savedAt": "2024-06-01T12:00:00.000Z",
  "entries": [
    { "method": "GET", "path": "/api/users", "status": 200, "duration": 45 }
  ]
}
```

## Usage example

```js
const { save, load, list, remove } = require('./sessionManager');

// Save parsed entries from a log file
save('dev-run-1', parsedEntries);

// Load and replay later
const { entries } = load('dev-run-1');

// List all sessions
console.log(list().message);

// Clean up
remove('dev-run-1');
```
