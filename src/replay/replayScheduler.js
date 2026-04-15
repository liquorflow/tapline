/**
 * replayScheduler.js
 * Schedules replayed requests with configurable delay and concurrency.
 */

const { sleep } = require('./replayUtils');

/**
 * Replay entries sequentially with a delay between each request.
 * @param {object[]} entries - Parsed log entries
 * @param {Function} replayFn - Async function that replays a single entry
 * @param {object} options
 * @param {number} options.delay - Milliseconds between requests (default: 0)
 * @param {boolean} options.preserveTiming - Use original timing gaps if available
 * @returns {Promise<object[]>} Results from each replay
 */
async function replaySequential(entries, replayFn, options = {}) {
  const { delay = 0, preserveTiming = false } = options;
  const results = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const result = await replayFn(entry);
    results.push(result);

    if (i < entries.length - 1) {
      if (preserveTiming && entries[i + 1].timestamp && entry.timestamp) {
        const gap = new Date(entries[i + 1].timestamp) - new Date(entry.timestamp);
        await sleep(Math.max(0, gap));
      } else if (delay > 0) {
        await sleep(delay);
      }
    }
  }

  return results;
}

/**
 * Replay entries in parallel batches.
 * @param {object[]} entries
 * @param {Function} replayFn
 * @param {object} options
 * @param {number} options.concurrency - Max parallel requests (default: 5)
 * @returns {Promise<object[]>}
 */
async function replayConcurrent(entries, replayFn, options = {}) {
  const { concurrency = 5 } = options;
  const results = [];

  for (let i = 0; i < entries.length; i += concurrency) {
    const batch = entries.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(replayFn));
    results.push(...batchResults);
  }

  return results;
}

module.exports = { replaySequential, replayConcurrent };
