// logRateLimiter.js — throttle entries by request rate per time window

/**
 * Count entries per time bucket (bucket size in ms)
 */
function countPerBucket(entries, bucketMs = 1000) {
  const buckets = {};
  for (const entry of entries) {
    const t = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
    const bucket = Math.floor(t / bucketMs) * bucketMs;
    buckets[bucket] = (buckets[bucket] || 0) + 1;
  }
  return buckets;
}

/**
 * Filter entries to at most maxPerWindow per windowMs sliding window
 */
function limitByRate(entries, maxPerWindow, windowMs = 1000) {
  if (!maxPerWindow || maxPerWindow <= 0) return entries;
  const result = [];
  const timestamps = [];

  for (const entry of entries) {
    const t = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
    // drop old timestamps outside window
    while (timestamps.length && t - timestamps[0] >= windowMs) {
      timestamps.shift();
    }
    if (timestamps.length < maxPerWindow) {
      timestamps.push(t);
      result.push(entry);
    }
  }
  return result;
}

/**
 * Compute average rate (requests per second)
 */
function averageRate(entries) {
  if (entries.length < 2) return 0;
  const times = entries
    .map(e => e.timestamp ? new Date(e.timestamp).getTime() : null)
    .filter(t => t !== null)
    .sort((a, b) => a - b);
  if (times.length < 2) return 0;
  const spanMs = times[times.length - 1] - times[0];
  if (spanMs === 0) return 0;
  return ((times.length - 1) / spanMs) * 1000;
}

/**
 * Peak rate across buckets
 */
function peakRate(entries, bucketMs = 1000) {
  const buckets = countPerBucket(entries, bucketMs);
  const counts = Object.values(buckets);
  if (!counts.length) return 0;
  return Math.max(...counts);
}

/**
 * Returns entries that were dropped by limitByRate, i.e. the throttled-out entries.
 * Useful for debugging or logging how many requests were suppressed.
 */
function droppedByRate(entries, maxPerWindow, windowMs = 1000) {
  const kept = new Set(limitByRate(entries, maxPerWindow, windowMs));
  return entries.filter(e => !kept.has(e));
}

module.exports = { countPerBucket, limitByRate, averageRate, peakRate, droppedByRate };
