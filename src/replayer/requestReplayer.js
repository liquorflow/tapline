const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Replays a single parsed HTTP request log entry.
 * @param {Object} entry - A parsed log entry from logParser
 * @param {Object} options - Replay options
 * @param {string} options.baseUrl - Override the base URL for requests
 * @param {number} options.delayMs - Delay before sending (ms)
 * @returns {Promise<Object>} - Response summary
 */
async function replayRequest(entry, options = {}) {
  const { baseUrl, delayMs = 0 } = options;

  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  const targetUrl = baseUrl
    ? new URL(entry.path, baseUrl).toString()
    : entry.url;

  if (!targetUrl) {
    throw new Error(`Cannot replay entry: no URL available (entry: ${JSON.stringify(entry)})`);
  }

  const parsed = new URL(targetUrl);
  const transport = parsed.protocol === 'https:' ? https : http;

  const reqOptions = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: parsed.pathname + (parsed.search || ''),
    method: entry.method || 'GET',
    headers: entry.headers || {},
  };

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const req = transport.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString(),
          durationMs: Date.now() - startTime,
          originalEntry: entry,
        });
      });
    });

    req.on('error', reject);

    if (entry.body) {
      req.write(entry.body);
    }

    req.end();
  });
}

/**
 * Replays an array of parsed log entries sequentially.
 * @param {Object[]} entries
 * @param {Object} options
 * @returns {Promise<Object[]>} - Array of response summaries
 */
async function replayAll(entries, options = {}) {
  const results = [];
  for (const entry of entries) {
    try {
      const result = await replayRequest(entry, options);
      results.push({ success: true, ...result });
    } catch (err) {
      results.push({ success: false, error: err.message, originalEntry: entry });
    }
  }
  return results;
}

module.exports = { replayRequest, replayAll };
