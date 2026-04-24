// segmentFormatter.js — format segment results for display

/**
 * @param {{ label: string, entries: object[] }[]} segments
 * @returns {string}
 */
function formatSegmentTable(segments) {
  if (!segments.length) return '(no segments)';
  const rows = segments.map(s => {
    const count = s.entries.length;
    const methods = [...new Set(s.entries.map(e => e.method))].join(',');
    const avgMs = s.entries.length
      ? Math.round(s.entries.reduce((a, e) => a + (e.duration ?? 0), 0) / count)
      : 0;
    const extra = s.start != null ? `  ${new Date(s.start).toISOString()} → ${new Date(s.end).toISOString()}` : '';
    return `  ${s.label.padEnd(16)} count=${String(count).padStart(4)}  methods=${methods.padEnd(12)}  avgMs=${String(avgMs).padStart(6)}${extra}`;
  });
  return ['Segments:', ...rows].join('\n');
}

/**
 * @param {{ label: string, entries: object[] }[]} segments
 * @returns {string}
 */
function formatSegmentJson(segments) {
  return JSON.stringify(
    segments.map(s => ({
      label: s.label,
      count: s.entries.length,
      ...(s.start != null ? { start: s.start, end: s.end } : {})
    })),
    null,
    2
  );
}

/**
 * @param {{ label: string, entries: object[] }[]} segments
 * @returns {string}
 */
function formatSegmentSummary(segments) {
  const total = segments.reduce((a, s) => a + s.entries.length, 0);
  const sizes = segments.map(s => s.entries.length);
  const min = Math.min(...sizes);
  const max = Math.max(...sizes);
  return `${segments.length} segment(s), ${total} total entries (min=${min}, max=${max})`;
}

module.exports = { formatSegmentTable, formatSegmentJson, formatSegmentSummary };
