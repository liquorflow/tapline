# logSampler

Sample HTTP log entries using various strategies before replaying or exporting.

## Modes

| Mode | Description |
|------|-------------|
| `head` | First N entries (default) |
| `tail` | Last N entries |
| `every` | Every Nth entry |
| `random` | N random entries |
| `rate` | Fraction of entries (0.0–1.0) |

## Usage

```js
const { sampleEntries } = require('./logSampler');

// First 20 entries
const top20 = sampleEntries(entries, { mode: 'head', value: 20 });

// 10% sample
const tenPct = sampleEntries(entries, { mode: 'rate', value: 0.1 });

// Every 5th request
const sparse = sampleEntries(entries, { mode: 'every', value: 5 });
```

## API

### `sampleEntries(entries, opts)`
Main entry point. `opts.mode` selects the strategy, `opts.value` is the parameter.

### Individual functions
- `sampleHead(entries, count)`
- `sampleTail(entries, count)`
- `sampleEveryN(entries, n)`
- `sampleRandom(entries, count)`
- `sampleByRate(entries, rate)`
