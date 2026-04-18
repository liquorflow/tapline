// logWindow.js — sliding and tumbling window operations on log entries

/**
 * Parse a timestamp string to ms
 */
function toMs(ts) {
  return new Date(ts).getTime();
}

/**
 * Return entries within a sliding window of `durationMs` ending at each entry's timestamp.
 */
function slidingWindow(entries, durationMs) {
  return entries.map((entry, i) => {
    const end = toMs(entry.timestamp);
    const start = end - durationMs;
    const window = entries.filter(e => {
      const t = toMs(e.timestamp);
      return t >= start && t <= end;
    });
    return { anchor: entry, window };
  });
}

/**
 * Split entries into tumbling (non-overlapping) windows of `durationMs`.
 */
function tumblingWindows(entries, durationMs) {
  if (!entries.length) return [];
  const sorted = [...entries].sort((a, b) => toMs(a.timestamp) - toMs(b.timestamp));
  const first = toMs(sorted[0].timestamp);
  const windows = [];
  let windowStart = first;
  let current = [];

  for (const entry of sorted) {
    const t = toMs(entry.timestamp);
    if (t < windowStart + durationMs) {
      current.push(entry);
    } else {
      windows.push({ start: new Date(windowStart).toISOString(), entries: current });
      windowStart = windowStart + Math.floor((t - windowStart) / durationMs) * durationMs;
      current = [entry];
    }
  }
  if (current.length) {
    windows.push({ start: new Date(windowStart).toISOString(), entries: current });
  }
  return windows;
}

/**
 * Summarize a tumbling window result.
 */
function summarizeWindows(windows) {
  return windows.map(w => ({
    start: w.start,
    count: w.entries.length,
    avgLatency: w.entries.length
      ? Math.round(w.entries.reduce((s, e) => s + (e.duration || 0), 0) / w.entries.length)
      : 0,
    errorCount: w.entries.filter(e => e.status >= 400).length
  }));
}

module.exports = { slidingWindow, tumblingWindows, summarizeWindows };
