// logTagger.js — tag entries with arbitrary key/value labels

function tagEntry(entry, tags = {}) {
  return { ...entry, tags: { ...(entry.tags || {}), ...tags } };
}

function tagEntries(entries, tags = {}) {
  return entries.map(e => tagEntry(e, tags));
}

function tagByCondition(entries, condition, tags = {}) {
  return entries.map(e => condition(e) ? tagEntry(e, tags) : e);
}

function tagByMethod(entries) {
  return entries.map(e => tagEntry(e, { method: e.method ? e.method.toLowerCase() : 'unknown' }));
}

function tagByStatusClass(entries) {
  return entries.map(e => {
    const s = e.status;
    const cls = s >= 500 ? '5xx' : s >= 400 ? '4xx' : s >= 300 ? '3xx' : s >= 200 ? '2xx' : 'unknown';
    return tagEntry(e, { statusClass: cls });
  });
}

function tagSlow(entries, threshold = 1000) {
  return tagByCondition(entries, e => e.duration >= threshold, { slow: true });
}

function removeTags(entry, keys = []) {
  const tags = { ...(entry.tags || {}) };
  keys.forEach(k => delete tags[k]);
  return { ...entry, tags };
}

module.exports = { tagEntry, tagEntries, tagByCondition, tagByMethod, tagByStatusClass, tagSlow, removeTags };
