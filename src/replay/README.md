# replay

Utilities for scheduling, throttling, filtering, and summarizing HTTP log replay.

## Modules

### `replayScheduler.js`
Schedules replay of log entries with configurable concurrency and delay between requests.

### `replayRunner.js`
Core runner helpers: detect failures, compute average duration, print result summaries.

### `replayUtils.js`
Shared utilities: `sleep`, `summarizeResults`, `formatSummary`.

### `replayThrottle.js`
Rate-limits outgoing replay requests. Supports per-second and burst caps.

```js
const { createThrottle } = require('./replayThrottle');
const throttle = createThrottle({ rps: 10, burst: 5 });
await throttle.acquire();
```

### `replayFilter.js`
Filters entries before they are dispatched during replay.

```js
const { applyReplayFilters } = require('./replayFilter');

const filtered = applyReplayFilters(entries, {
  methods: ['GET', 'POST'],
  statuses: [200, 201],
  pathPattern: '^/api',
  maxLatency: 500
});
```

#### Filter options

| Option        | Type       | Description                                      |
|---------------|------------|--------------------------------------------------|
| `methods`     | `string[]` | Allowed HTTP methods (case-insensitive)          |
| `statuses`    | `number[]` | Allowed HTTP status codes                        |
| `pathPattern` | `string`   | Regex or prefix matched against `entry.path`     |
| `maxLatency`  | `number`   | Maximum `entry.duration` in ms to include        |

All options are optional; omitting a filter passes all entries through.
