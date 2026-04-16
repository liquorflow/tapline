import { summarizeResults, formatSummary } from './replayUtils.js';

/**
 * Determines if an HTTP status code represents a failure.
 * @param {number} status
 * @returns {boolean}
 */
export function isFailure(status) {
  return status >= 400;
}

/**
 * Calculates the average duration from a list of results.
 * @param {Array<{duration: number}>} results
 * @returns {number}
 */
export function averageDuration(results) {
  if (results.length === 0) return 0;
  const total = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  return Math.round(total / results.length);
}

/**
 * Prints a formatted summary of replay results to stdout.
 * @param {Array<{status: number, url: string, duration: number}>} results
 */
export function printSummary(results) {
  const total = results.length;
  const failures = results.filter(r => isFailure(r.status)).length;
  const successes = total - failures;
  const avgMs = averageDuration(results);

  console.log('--- Replay Summary ---');
  console.log(`Total requests : ${total}`);
  console.log(`Success        : ${successes}`);
  console.log(`Fail           : ${failures}`);
  console.log(`Avg duration   : ${avgMs}ms`);
  console.log('----------------------');
}
