/**
 * replayRunner.js
 * High-level runner that wires together scheduler, replayer, and reporting.
 */

const { replaySequential, replayConcurrent } = require('./replayScheduler');
const { summarizeResults, formatSummary } = require('./replayUtils');

/**
 * Run a full replay session.
 * @param {object[]} entries - Log entries to replay
 * @param {Function} replayFn - Function that sends a single request
 * @param {object} options
 * @param {string}  options.mode       - 'sequential' | 'concurrent' (default: 'sequential')
 * @param {number}  options.delay      - Delay between requests in ms
 * @param {boolean} options.preserveTiming
 * @param {number}  options.concurrency
 * @param {boolean} options.verbose    - Print per-request lines
 * @returns {Promise<{ results: object[], summary: object }>}
 */
async function runReplay(entries, replayFn, options = {}) {
  const { mode = 'sequential', verbose = false } = options;

  const wrappedFn = async (entry) => {
    const start = Date.now();
    try {
      const result = await replayFn(entry);
      const latency = Date.now() - start;
      const out = { success: true, latency, status: result.status, entry };
      if (verbose) {
        console.log(`  [${result.status}] ${entry.method} ${entry.path} — ${latency}ms`);
      }
      return out;
    } catch (err) {
      const latency = Date.now() - start;
      if (verbose) {
        console.error(`  [ERR] ${entry.method} ${entry.path} — ${err.message}`);
      }
      return { success: false, latency, status: null, error: err.message, entry };
    }
  };

  let results;
  if (mode === 'concurrent') {
    results = await replayConcurrent(entries, wrappedFn, options);
  } else {
    results = await replaySequential(entries, wrappedFn, options);
  }

  const summary = summarizeResults(results);
  return { results, summary };
}

/**
 * Print a replay summary to stdout.
 * @param {object} summary
 */
function printSummary(summary) {
  console.log('\nReplay complete — ' + formatSummary(summary));
}

module.exports = { runReplay, printSummary };
