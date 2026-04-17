// logRetry.js — retry logic for failed replay entries

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_DELAY_MS = 200;

function isRetryable(result) {
  if (!result) return false;
  const status = result.status;
  return !status || status === 0 || status >= 500;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryRequest(entry, requester, options = {}) {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  const backoff = options.backoff ?? false;

  let lastResult = null;
  let attempts = 0;

  for (let i = 0; i <= maxRetries; i++) {
    attempts++;
    try {
      const result = await requester(entry);
      if (!isRetryable(result)) {
        return { entry, result, attempts, success: true };
      }
      lastResult = result;
    } catch (err) {
      lastResult = { error: err.message, status: 0 };
    }

    if (i < maxRetries) {
      const wait = backoff ? delayMs * Math.pow(2, i) : delayMs;
      await sleep(wait);
    }
  }

  return { entry, result: lastResult, attempts, success: false };
}

async function retryAll(entries, requester, options = {}) {
  const results = [];
  for (const entry of entries) {
    const r = await retryRequest(entry, requester, options);
    results.push(r);
  }
  return results;
}

function summarizeRetries(results) {
  const total = results.length;
  const succeeded = results.filter(r => r.success).length;
  const failed = total - succeeded;
  const totalAttempts = results.reduce((sum, r) => sum + r.attempts, 0);
  return { total, succeeded, failed, totalAttempts };
}

module.exports = { isRetryable, retryRequest, retryAll, summarizeRetries };
