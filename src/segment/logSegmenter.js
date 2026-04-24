// logSegmenter.js — segment log entries into named ranges based on time or index

/**
 * Split entries into segments of fixed size (by count)
 * @param {object[]} entries
 * @param {number} size
 * @returns {{ label: string, entries: object[] }[]}
 */
function segmentByCount(entries, size) {
  if (size < 1) throw new Error('Segment size must be >= 1');
  const segments = [];
  for (let i = 0; i < entries.length; i += size) {
    const chunk = entries.slice(i, i + size);
    segments.push({ label: `segment-${Math.floor(i / size) + 1}`, entries: chunk });
  }
  return segments;
}

/**
 * Split entries into N equal-ish segments
 * @param {object[]} entries
 * @param {number} n
 * @returns {{ label: string, entries: object[] }[]}
 */
function segmentIntoN(entries, n) {
  if (n < 1) throw new Error('N must be >= 1');
  const size = Math.ceil(entries.length / n);
  return segmentByCount(entries, size);
}

/**
 * Segment entries by a time interval (ms)
 * @param {object[]} entries
 * @param {number} intervalMs
 * @returns {{ label: string, start: number, end: number, entries: object[] }[]}
 */
function segmentByTime(entries, intervalMs) {
  if (!entries.length) return [];
  const sorted = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const origin = new Date(sorted[0].timestamp).getTime();
  const buckets = new Map();

  for (const entry of sorted) {
    const t = new Date(entry.timestamp).getTime();
    const bucket = Math.floor((t - origin) / intervalMs);
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(entry);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([bucket, ents]) => ({
      label: `t${bucket}`,
      start: origin + bucket * intervalMs,
      end: origin + (bucket + 1) * intervalMs,
      entries: ents
    }));
}

/**
 * Segment entries by a field value (e.g. method, status)
 * @param {object[]} entries
 * @param {string} field
 * @returns {{ label: string, entries: object[] }[]}
 */
function segmentByField(entries, field) {
  const map = new Map();
  for (const entry of entries) {
    const key = String(entry[field] ?? 'unknown');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(entry);
  }
  return Array.from(map.entries()).map(([label, ents]) => ({ label, entries: ents }));
}

/**
 * Entry point — dispatch to the right strategy
 */
function segmentEntries(entries, options = {}) {
  const { by = 'count', size = 10, n, intervalMs, field } = options;
  if (by === 'count') return segmentByCount(entries, size);
  if (by === 'n') return segmentIntoN(entries, n ?? 2);
  if (by === 'time') return segmentByTime(entries, intervalMs ?? 60000);
  if (by === 'field') return segmentByField(entries, field ?? 'method');
  throw new Error(`Unknown segmentation strategy: ${by}`);
}

module.exports = { segmentByCount, segmentIntoN, segmentByTime, segmentByField, segmentEntries };
