# resample

Downsample or aggregate log entries over time intervals.

## Functions

### `resampleByInterval(entries, intervalMs, strategy)`

Groups entries into fixed time buckets and picks one representative per bucket.

- `strategy`: `'first'` (default), `'last'`, or `'median'`

```js
const { resampleByInterval } = require('./logResampler');
const sampled = resampleByInterval(entries, 5000, 'last'); // one per 5s
```

### `resampleToCount(entries, maxCount)`

Evenly thins entries down to `maxCount`, preserving temporal spread.

```js
const thin = resampleToCount(entries, 100);
```

### `resampleAggregate(entries, intervalMs)`

Collapses each time bucket into a single summary entry with averaged duration and dominant status. Adds `_sampleSize` field.

```js
const agg = resampleAggregate(entries, 60000); // 1-minute buckets
```

### `resampleByCount(entries, bucketCount)`

Divides entries into exactly `bucketCount` equal-sized time buckets, regardless of how many entries fall in each. Returns one representative entry per non-empty bucket using the `'first'` strategy.

Useful when you want a fixed number of data points for charting without worrying about the interval duration.

```js
const { resampleByCount } = require('./logResampler');
const chart = resampleByCount(entries, 50); // exactly 50 buckets
```

## Formatters

```js
const { formatResampleTable, formatResampleJson, formatResampleSummary } = require('./resampleFormatter');

console.log(formatResampleTable(agg));
console.log(formatResampleSummary(agg));
```

## Use Cases

- Reduce noise in large log files before visualization
- Build time-series charts from dense request logs
- Compare traffic patterns across time windows
