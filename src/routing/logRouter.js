// logRouter.js — route log entries into named buckets based on rules

/**
 * @typedef {{ field: string, match: string|RegExp, bucket: string }} RouteRule
 */

/**
 * Match a single entry against a rule.
 * @param {object} entry
 * @param {RouteRule} rule
 * @returns {boolean}
 */
function matchesRule(entry, rule) {
  const value = String(entry[rule.field] ?? '');
  if (rule.match instanceof RegExp) return rule.match.test(value);
  return value === String(rule.match);
}

/**
 * Route entries into named buckets using an ordered list of rules.
 * First matching rule wins. Unmatched entries go to 'default'.
 * @param {object[]} entries
 * @param {RouteRule[]} rules
 * @returns {Record<string, object[]>}
 */
function routeEntries(entries, rules) {
  const buckets = { default: [] };
  for (const rule of rules) {
    if (!buckets[rule.bucket]) buckets[rule.bucket] = [];
  }
  for (const entry of entries) {
    let matched = false;
    for (const rule of rules) {
      if (matchesRule(entry, rule)) {
        buckets[rule.bucket].push(entry);
        matched = true;
        break;
      }
    }
    if (!matched) buckets.default.push(entry);
  }
  return buckets;
}

/**
 * Return bucket names and their entry counts.
 * @param {Record<string, object[]>} buckets
 * @returns {Record<string, number>}
 */
function summarizeRoutes(buckets) {
  return Object.fromEntries(
    Object.entries(buckets).map(([k, v]) => [k, v.length])
  );
}

module.exports = { matchesRule, routeEntries, summarizeRoutes };
