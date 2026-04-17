// logMasker.js — mask sensitive fields in log entries

const DEFAULT_MASKED_HEADERS = ['authorization', 'cookie', 'set-cookie', 'x-api-key'];
const MASK = '***';

function maskHeaders(headers = {}, fields = DEFAULT_MASKED_HEADERS) {
  const lower = fields.map(f => f.toLowerCase());
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) =>
      lower.includes(k.toLowerCase()) ? [k, MASK] : [k, v]
    )
  );
}

function maskPath(path = '', pattern) {
  if (!pattern) return path;
  const re = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'g');
  return path.replace(re, MASK);
}

function maskQueryParams(path = '', params = []) {
  if (!params.length) return path;
  return path.replace(/([?&])([^=&]+)=([^&]*)/g, (match, sep, key, val) => {
    return params.includes(key) ? `${sep}${key}=${MASK}` : match;
  });
}

function maskEntry(entry, options = {}) {
  const { headers, pathPattern, queryParams } = options;
  let result = { ...entry };

  if (entry.headers) {
    result.headers = maskHeaders(entry.headers, headers);
  }
  if (pathPattern && entry.path) {
    result.path = maskPath(entry.path, pathPattern);
  }
  if (queryParams && entry.path) {
    result.path = maskQueryParams(entry.path, queryParams);
  }

  return result;
}

function maskEntries(entries, options = {}) {
  return entries.map(e => maskEntry(e, options));
}

module.exports = { maskHeaders, maskPath, maskQueryParams, maskEntry, maskEntries };
