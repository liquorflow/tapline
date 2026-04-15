/**
 * logParser.js
 * Parses raw HTTP request log entries into structured objects.
 */

const LOG_LINE_REGEX =
  /^(\S+)\s+(\S+)\s+HTTP\/(\d\.\d)\s+(\d{3})\s+(\d+)\s*(\S*)$/;

/**
 * Parse a single log line into a request object.
 * Expected format:
 *   METHOD URL HTTP/VERSION STATUS_CODE RESPONSE_TIME_MS [TIMESTAMP]
 *
 * @param {string} line - Raw log line
 * @returns {{ method, url, httpVersion, statusCode, responseTimeMs, timestamp } | null}
 */
function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  const match = trimmed.match(LOG_LINE_REGEX);
  if (!match) return null;

  const [, method, url, httpVersion, statusCode, responseTimeMs, timestamp] =
    match;

  return {
    method: method.toUpperCase(),
    url,
    httpVersion,
    statusCode: parseInt(statusCode, 10),
    responseTimeMs: parseInt(responseTimeMs, 10),
    timestamp: timestamp || null,
  };
}

/**
 * Parse a multi-line log string into an array of request objects.
 *
 * @param {string} raw - Full log content
 * @returns {Array}
 */
function parseLog(raw) {
  if (typeof raw !== 'string') throw new TypeError('Input must be a string');

  return raw
    .split('\n')
    .map(parseLine)
    .filter(Boolean);
}

module.exports = { parseLine, parseLog };
