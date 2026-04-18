// logTimeline.js — bucket log entries into time-based intervals

/**
 * Parse a timestamp string into ms epoch.
 */
function toMs(ts) {
  return new Date(ts).getTime();
}

/**
 * Bucket entries into fixed-width time windows (in seconds).
 * Returns an array of { windowStart, entries }.
 */
function bucketByInterval(entries, intervalSec = 60) {
  if (!entries.length) return [];
  const ms = intervalSec * 1000;
  const buckets = new Map();

  for (const entry of entries) {
    const t = toMs(entry.timestamp);
    if (isNaN(t)) continue;
    const key = Math.floor(t / ms) * ms;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(entry);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([windowStart, entries]) => ({ windowStart: new Date(windowStart).toISOString(), entries }));
}

/**
 * Return the span (first timestamp, last timestamp, durationMs) for a set of entries.
 */
function timelineSpan(entries) {
  if (!entries.length) return null;
  const times = entries.map(e => toMs(e.timestamp)).filter(t => !isNaN(t));
  if (!times.length) return null;
  const first = Math.min(...times);
  const last = Math.max(...times);
  return {
    first: new Date(first).toISOString(),
    last: new Date(last).toISOString(),
    durationMs: last - first
  };
}

/**
 * Summarize each bucket: count, avgLatency, errorCount.
 */
function summarizeTimeline(buckets) {
  return buckets.map(({ windowStart, entries }) => {
    const count = entries.length;
    const avgLatency = count
      ? Math.round(entries.reduce((s, e) => s + (e.duration || 0), 0) / count)
      : 0;
    const errorCount = entries.filter(e => e.status >= 500).length;
    return { windowStart, count, avgLatency, errorCount };
  });
}

module.exports = { bucketByInterval, timelineSpan, summarizeTimeline };
