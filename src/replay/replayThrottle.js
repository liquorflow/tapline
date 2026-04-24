// replayThrottle.js — controls replay pacing by rate-limiting outgoing requests

const { sleep } = require('./replayUtils');

/**
 * Build a throttle config from options.
 * @param {object} opts
 * @param {number} [opts.rps] - requests per second
 * @param {number} [opts.concurrency] - max concurrent requests
 * @param {number} [opts.delayMs] - fixed delay between requests in ms
 */
function buildThrottleConfig(opts = {}) {
  const rps = opts.rps && opts.rps > 0 ? opts.rps : null;
  const concurrency = opts.concurrency && opts.concurrency > 0 ? opts.concurrency : 1;
  const delayMs = opts.delayMs != null ? opts.delayMs : rps ? Math.floor(1000 / rps) : 0;
  return { rps, concurrency, delayMs };
}

/**
 * Create a throttled executor that respects concurrency and delay settings.
 * @param {object} config - result of buildThrottleConfig
 * @returns {{ run: Function, stats: Function }}
 */
function createThrottle(config) {
  const { concurrency, delayMs } = config;
  let active = 0;
  let completed = 0;
  let dropped = 0;

  async function run(fn) {
    if (active >= concurrency) {
      dropped++;
      return null;
    }
    active++;
    try {
      if (delayMs > 0) await sleep(delayMs);
      const result = await fn();
      completed++;
      return result;
    } finally {
      active--;
    }
  }

  function stats() {
    return { active, completed, dropped };
  }

  return { run, stats };
}

/**
 * Run an array of async tasks through a throttle.
 * @param {Array<Function>} tasks - array of () => Promise
 * @param {object} config
 * @returns {Promise<Array>}
 */
async function runThrottled(tasks, config) {
  const throttle = createThrottle(config);
  const results = [];
  for (const task of tasks) {
    const result = await throttle.run(task);
    results.push(result);
  }
  return { results, stats: throttle.stats() };
}

module.exports = { buildThrottleConfig, createThrottle, runThrottled };
