// logEnricher.js — adds derived fields to log entries

function enrichWithDuration(entry) {
  if (entry.latency == null) return entry;
  return {
    ...entry,
    durationClass: entry.latency < 100 ? 'fast' : entry.latency < 500 ? 'medium' : 'slow'
  };
}

function enrichWithHost(entry, defaultHost = 'localhost') {
  const host = entry.host || defaultHost;
  return { ...entry, host };
}

function enrichWithTimestamp(entry) {
  if (!entry.timestamp) return entry;
  const date = new Date(entry.timestamp);
  if (isNaN(date)) return entry;
  return {
    ...entry,
    hour: date.getHours(),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
  };
}

function enrichWithRequestId(entry, counter = { n: 0 }) {
  counter.n += 1;
  return { ...entry, requestId: entry.requestId || `req-${counter.n}` };
}

function enrichEntry(entry, options = {}) {
  let e = { ...entry };
  if (options.duration !== false) e = enrichWithDuration(e);
  if (options.host !== false) e = enrichWithHost(e, options.defaultHost);
  if (options.timestamp !== false) e = enrichWithTimestamp(e);
  return e;
}

function enrichEntries(entries, options = {}) {
  const counter = { n: 0 };
  return entries.map(e => {
    let enriched = enrichEntry(e, options);
    if (options.requestId !== false) enriched = enrichWithRequestId(enriched, counter);
    return enriched;
  });
}

module.exports = {
  enrichWithDuration,
  enrichWithHost,
  enrichWithTimestamp,
  enrichWithRequestId,
  enrichEntry,
  enrichEntries
};
