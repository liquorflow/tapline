// heatmapFormatter.js — render heatmap as text, table, or JSON

'use strict';

const { summarizeHeatmap, DAYS } = require('./logHeatmap');

// Unicode block chars for density visualization
const BLOCKS = [' ', '░', '▒', '▓', '█'];

function densityChar(count, max) {
  if (max === 0) return BLOCKS[0];
  const idx = Math.ceil((count / max) * (BLOCKS.length - 1));
  return BLOCKS[idx];
}

/**
 * Render a compact ASCII heatmap grid.
 */
function formatHeatmapGrid(entries) {
  const { matrix, max } = summarizeHeatmap(entries);
  const hourHeader = '     ' + Array.from({ length: 24 }, (_, h) => String(h).padStart(2)).join('');
  const lines = [hourHeader];

  for (let d = 0; d < 7; d++) {
    const rowChars = matrix[d].map(c => densityChar(c, max).repeat(2)).join('');
    lines.push(`${DAYS[d].padEnd(4)} ${rowChars}`);
  }

  return lines.join('\n');
}

/**
 * Render heatmap as a JSON-serializable summary.
 */
function formatHeatmapJson(entries) {
  const summary = summarizeHeatmap(entries);
  return JSON.stringify(
    {
      total: summary.total,
      max: summary.max,
      peak: summary.peak,
      rows: summary.rows.map(r => ({ day: r.day, hours: r.hours, total: r.rowTotal })),
    },
    null,
    2
  );
}

/**
 * One-line summary of the heatmap.
 */
function formatHeatmapSummary(entries) {
  const { total, peak } = summarizeHeatmap(entries);
  if (total === 0) return 'No entries to heatmap.';
  return `${total} requests — peak: ${peak.day} at ${peak.hour}:00 (${peak.count} req)`;
}

module.exports = { formatHeatmapGrid, formatHeatmapJson, formatHeatmapSummary, densityChar };
