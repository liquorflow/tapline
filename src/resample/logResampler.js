// logResampler.js — downsample or upsample log entries over time buckets

const { toMs } = require('../timeline/logTimeline');

/**
 * Group entries into fixed-size time buckets (ms), pick one representative per bucket.
 * @param {object[]} entries
 * @param {number} intervalMs
 * @param {'first'|'last'|'median'} strategy
 * @returns {object[]}
 */
function resampleByInterval(entries, intervalMs, strategy = 'first') {
  const buckets = new Map();
  for (const entry of entries) {
    const t = toMs(entry.timestamp);
    const key = Math.floor(t / intervalMs) * intervalMs;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(entry);
  }
  const result = [];
  for (const [, group] of [...buckets.entries()].sort((a, b) => a[0] - b[0])) {
    result.push(pick(group, strategy));
  }
  return result;
}

function pick(group, strategy) {
  if (strategy === 'last') return group[group.length - 1];
  if (strategy === 'median') return group[Math.floor(group.length / 2)];
  return group[0];
}

/**
 * Keep at most maxCount entries, evenly spaced across the full set.
 */
function resampleToCount(entries, maxCount) {
  if (entries.length <= maxCount) return [...entries];
  const step = (entries.length - 1) / (maxCount - 1);
  return Array.from({ length: maxCount }, (_, i) => entries[Math.round(i * step)]);
}

/**
 * Aggregate a bucket into a summary entry (avg latency, dominant status).
 */
function aggregateBucket(entries) {
  if (!entries.length) return null;
  const avgDuration = Math.round(entries.reduce((s, e) => s + (e.duration || 0), 0) / entries.length);
  const statusCounts = {};
  for (const e of entries) statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
  const status = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0][0];
  return { ...entries[0], duration: avgDuration, status: Number(status), _sampleSize: entries.length };
}

/**
 * Resample by interval, collapsing each bucket into an aggregate entry.
 */
function resampleAggregate(entries, intervalMs) {
  const buckets = new Map();
  for (const entry of entries) {
    const t = toMs(entry.timestamp);
    const key = Math.floor(t / intervalMs) * intervalMs;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(entry);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, group]) => aggregateBucket(group))
    .filter(Boolean);
}

module.exports = { resampleByInterval, resampleToCount, aggregateBucket, resampleAggregate };
