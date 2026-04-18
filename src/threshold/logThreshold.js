// logThreshold.js — flag entries that exceed defined thresholds

function exceedsLatency(entry, maxMs) {
  return typeof entry.duration === 'number' && entry.duration > maxMs;
}

function exceedsErrorRate(entries, maxRate) {
  if (!entries.length) return false;
  const errors = entries.filter(e => e.status >= 500).length;
  return errors / entries.length > maxRate;
}

function flagByLatency(entries, maxMs) {
  return entries.map(e => ({
    ...e,
    flags: [...(e.flags || []), ...(exceedsLatency(e, maxMs) ? ['high-latency'] : [])]
  }));
}

function flagByStatus(entries, minStatus = 400) {
  return entries.map(e => ({
    ...e,
    flags: [...(e.flags || []), ...(e.status >= minStatus ? ['bad-status'] : [])]
  }));
}

function summarizeThresholds(entries) {
  const flagged = entries.filter(e => e.flags && e.flags.length > 0);
  const byFlag = {};
  for (const e of flagged) {
    for (const f of e.flags) {
      byFlag[f] = (byFlag[f] || 0) + 1;
    }
  }
  return {
    total: entries.length,
    flagged: flagged.length,
    byFlag
  };
}

function applyThresholds(entries, opts = {}) {
  let result = entries;
  if (opts.maxLatency != null) result = flagByLatency(result, opts.maxLatency);
  if (opts.minStatus != null) result = flagByStatus(result, opts.minStatus);
  return result;
}

module.exports = { exceedsLatency, exceedsErrorRate, flagByLatency, flagByStatus, summarizeThresholds, applyThresholds };
