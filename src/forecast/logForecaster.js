/**
 * logForecaster.js
 * Simple time-series forecasting for log metrics (latency, error rate, request volume).
 * Uses linear regression and moving averages to project trends forward.
 */

/**
 * Compute a simple linear regression over [x, y] pairs.
 * Returns { slope, intercept }.
 */
function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.[1] ?? 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const [x, y] of points) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/**
 * Build time-series data points from log entries bucketed by interval (ms).
 * @param {object[]} entries
 * @param {string} field - 'duration' | 'status' | 'count'
 * @param {number} intervalMs
 * @returns {{ x: number, y: number, bucket: number }[]}
 */
function buildTimeSeries(entries, field, intervalMs = 60_000) {
  if (!entries.length) return [];

  const buckets = new Map();
  for (const entry of entries) {
    const t = new Date(entry.timestamp).getTime();
    const bucket = Math.floor(t / intervalMs) * intervalMs;
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(entry);
  }

  const sorted = [...buckets.entries()].sort((a, b) => a[0] - b[0]);
  const origin = sorted[0][0];

  return sorted.map(([bucket, group], i) => {
    let y;
    if (field === 'count') {
      y = group.length;
    } else if (field === 'duration') {
      y = group.reduce((s, e) => s + (e.duration ?? 0), 0) / group.length;
    } else if (field === 'errorRate') {
      const errors = group.filter(e => (e.status ?? 0) >= 400).length;
      y = errors / group.length;
    } else {
      y = group.reduce((s, e) => s + (e[field] ?? 0), 0) / group.length;
    }
    return { x: (bucket - origin) / intervalMs, y, bucket };
  });
}

/**
 * Forecast `steps` future buckets using linear regression on the time series.
 * @param {object[]} entries
 * @param {string} field
 * @param {number} steps - number of future intervals to forecast
 * @param {number} intervalMs
 * @returns {{ bucket: number, predicted: number }[]}
 */
function forecast(entries, field, steps = 5, intervalMs = 60_000) {
  const series = buildTimeSeries(entries, field, intervalMs);
  if (series.length < 2) return [];

  const points = series.map(({ x, y }) => [x, y]);
  const { slope, intercept } = linearRegression(points);

  const lastBucket = series[series.length - 1].bucket;
  const lastX = series[series.length - 1].x;

  return Array.from({ length: steps }, (_, i) => {
    const x = lastX + i + 1;
    const predicted = Math.max(0, slope * x + intercept);
    return {
      bucket: lastBucket + (i + 1) * intervalMs,
      predicted: Math.round(predicted * 1000) / 1000,
    };
  });
}

/**
 * Compute a trailing moving average over the time series.
 * @param {object[]} entries
 * @param {string} field
 * @param {number} window - number of buckets in the moving average window
 * @param {number} intervalMs
 * @returns {{ bucket: number, avg: number }[]}
 */
function movingAverage(entries, field, window = 3, intervalMs = 60_000) {
  const series = buildTimeSeries(entries, field, intervalMs);
  return series.map((point, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = series.slice(start, i + 1);
    const avg = slice.reduce((s, p) => s + p.y, 0) / slice.length;
    return { bucket: point.bucket, avg: Math.round(avg * 1000) / 1000 };
  });
}

/**
 * Summarize forecast results with trend direction and magnitude.
 * @param {{ bucket: number, predicted: number }[]} forecastPoints
 * @returns {{ trend: string, delta: number, first: number, last: number }}
 */
function summarizeForecast(forecastPoints) {
  if (!forecastPoints.length) return { trend: 'flat', delta: 0, first: 0, last: 0 };
  const first = forecastPoints[0].predicted;
  const last = forecastPoints[forecastPoints.length - 1].predicted;
  const delta = Math.round((last - first) * 1000) / 1000;
  const trend = delta > 0 ? 'rising' : delta < 0 ? 'falling' : 'flat';
  return { trend, delta, first, last };
}

module.exports = {
  buildTimeSeries,
  linearRegression,
  forecast,
  movingAverage,
  summarizeForecast,
};
