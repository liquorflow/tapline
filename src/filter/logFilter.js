/**
 * logFilter.js
 * Utilities for filtering parsed HTTP log entries by various criteria.
 */

/**
 * Filter log entries by HTTP method.
 * @param {Array} entries - Array of parsed log entry objects
 * @param {string} method - HTTP method to filter by (e.g. 'GET', 'POST')
 * @returns {Array}
 */
function filterByMethod(entries, method) {
  if (!method) return entries;
  const upper = method.toUpperCase();
  return entries.filter((entry) => entry.method && entry.method.toUpperCase() === upper);
}

/**
 * Filter log entries by status code or range.
 * @param {Array} entries
 * @param {number|string} status - Exact code (404) or range prefix ('4' for 4xx, '5' for 5xx)
 * @returns {Array}
 */
function filterByStatus(entries, status) {
  if (status === undefined || status === null) return entries;
  const str = String(status);
  return entries.filter((entry) => {
    if (!entry.status) return false;
    const entryStr = String(entry.status);
    return entryStr.startsWith(str);
  });
}

/**
 * Filter log entries by a URL path prefix or substring.
 * @param {Array} entries
 * @param {string} pathPattern - Substring to match against entry path
 * @returns {Array}
 */
function filterByPath(entries, pathPattern) {
  if (!pathPattern) return entries;
  return entries.filter(
    (entry) => entry.path && entry.path.includes(pathPattern)
  );
}

/**
 * Apply multiple filters at once from an options object.
 * @param {Array} entries
 * @param {{ method?: string, status?: string|number, path?: string }} options
 * @returns {Array}
 */
function applyFilters(entries, options = {}) {
  let result = entries;
  if (options.method) result = filterByMethod(result, options.method);
  if (options.status !== undefined && options.status !== null) result = filterByStatus(result, options.status);
  if (options.path) result = filterByPath(result, options.path);
  return result;
}

module.exports = { filterByMethod, filterByStatus, filterByPath, applyFilters };
