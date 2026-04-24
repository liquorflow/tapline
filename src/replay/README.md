# replay

Utilities for replaying HTTP log entries against a live server, with scheduling, throttling, and result summarization.

## Modules

### `replayScheduler.js`
Schedules replay of log entries with configurable concurrency and ordering.

### `replayRunner.js`
Core runner — sends requests and collects pass/fail results.

- `isFailure(result)` — returns true if the result status indicates an error
- `averageDuration(results)` — computes mean duration across replay results
- `printSummary(results)` — prints a formatted summary to stdout

### `replayUtils.js`
Shared utilities used across replay modules.

- `sleep(ms)` — returns a promise that resolves after `ms` milliseconds
- `summarizeResults(results)` — aggregates pass/fail/error counts
- `formatSummary(summary)` — formats a summary object as a human-readable string

### `replayThrottle.js`
Rate-limiting and concurrency control for replay execution.

- `buildThrottleConfig(opts)` — builds a normalized throttle config from CLI or API options
  - `opts.rps` — target requests per second (derives `delayMs` automatically)
  - `opts.concurrency` — max number of concurrent in-flight requests (default: 1)
  - `opts.delayMs` — explicit fixed delay between requests in ms
- `createThrottle(config)` — returns a `{ run, stats }` throttle instance
  - `run(fn)` — executes an async task if concurrency allows, otherwise returns `null`
  - `stats()` — returns `{ active, completed, dropped }`
- `runThrottled(tasks, config)` — runs an array of task functions through a throttle, returns `{ results, stats }`

## Usage

```js
const { buildThrottleConfig, runThrottled } = require('./replayThrottle');

const config = buildThrottleConfig({ rps: 5, concurrency: 2 });
const tasks = entries.map(entry => () => fetch(entry.path));
const { results, stats } = await runThrottled(tasks, config);
console.log(`Completed: ${stats.completed}, Dropped: ${stats.dropped}`);
```
