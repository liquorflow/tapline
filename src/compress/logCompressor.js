// logCompressor.js — run-length and field-level compression utilities for log entries

'use strict';

/**
 * Collapse consecutive entries with the same method+path+status into one
 * with a `count` field.
 */
function runLengthCompress(entries) {
  if (!entries.length) return [];
  const result = [];
  let current = { ...entries[0], count: 1 };

  for (let i = 1; i < entries.length; i++) {
    const e = entries[i];
    if (
      e.method === current.method &&
      e.path === current.path &&
      e.status === current.status
    ) {
      current.count++;
      current.duration = Math.round((current.duration + e.duration) / 2);
    } else {
      result.push(current);
      current = { ...e, count: 1 };
    }
  }
  result.push(current);
  return result;
}

/**
 * Strip fields that match a default / uninteresting value to reduce noise.
 */
function stripDefaults(entry, defaults = {}) {
  const out = {};
  for (const [k, v] of Object.entries(entry)) {
    if (defaults[k] !== undefined && defaults[k] === v) continue;
    out[k] = v;
  }
  return out;
}

/**
 * Delta-encode duration values relative to the previous entry.
 */
function deltaEncodeDurations(entries) {
  let prev = 0;
  return entries.map(e => {
    const delta = e.duration - prev;
    prev = e.duration;
    return { ...e, duration: delta };
  });
}

/**
 * Restore delta-encoded durations back to absolute values.
 */
function deltaDecodeDurations(entries) {
  let acc = 0;
  return entries.map(e => {
    acc += e.duration;
    return { ...e, duration: acc };
  });
}

/**
 * High-level: compress entries using run-length + delta encoding.
 */
function compressEntries(entries, opts = {}) {
  let result = runLengthCompress(entries);
  if (opts.delta) result = deltaEncodeDurations(result);
  if (opts.defaults) result = result.map(e => stripDefaults(e, opts.defaults));
  return result;
}

module.exports = {
  runLengthCompress,
  stripDefaults,
  deltaEncodeDurations,
  deltaDecodeDurations,
  compressEntries,
};
