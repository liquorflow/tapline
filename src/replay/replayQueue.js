// replayQueue.js — manages an ordered queue of entries for replay with priority and deduplication

'use strict';

/**
 * Create a new replay queue
 * @param {Object} opts
 * @param {number} opts.maxSize - max entries in queue (default: 1000)
 * @param {boolean} opts.dedupe - skip duplicate entries by method+path (default: false)
 */
function createQueue({ maxSize = 1000, dedupe = false } = {}) {
  const items = [];
  const seen = new Set();

  return {
    enqueue(entry) {
      if (items.length >= maxSize) return false;
      if (dedupe) {
        const key = `${entry.method}:${entry.path}`;
        if (seen.has(key)) return false;
        seen.add(key);
      }
      items.push({ ...entry, _queuedAt: Date.now() });
      return true;
    },

    dequeue() {
      return items.shift() || null;
    },

    peek() {
      return items[0] || null;
    },

    size() {
      return items.length;
    },

    isEmpty() {
      return items.length === 0;
    },

    clear() {
      items.length = 0;
      seen.clear();
    },

    toArray() {
      return [...items];
    },

    drainAll() {
      const all = [...items];
      items.length = 0;
      seen.clear();
      return all;
    }
  };
}

/**
 * Fill a queue from an array of log entries
 * @param {Object[]} entries
 * @param {Object} opts - passed to createQueue
 * @returns {{ queue, skipped }}
 */
function fillQueue(entries, opts = {}) {
  const queue = createQueue(opts);
  let skipped = 0;
  for (const entry of entries) {
    const added = queue.enqueue(entry);
    if (!added) skipped++;
  }
  return { queue, skipped };
}

module.exports = { createQueue, fillQueue };
