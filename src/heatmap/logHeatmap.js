// logHeatmap.js — build request frequency heatmaps by hour/day

'use strict';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * Parse timestamp into { day, hour }
 */
function toCell(timestamp) {
  const d = new Date(timestamp);
  return { day: d.getDay(), hour: d.getHours() };
}

/**
 * Build a 7x24 heatmap matrix (day x hour) with request counts.
 * Returns: { matrix: number[][], max: number, total: number }
 */
function buildHeatmap(entries) {
  const matrix = Array.from({ length: 7 }, () => new Array(24).fill(0));
  let total = 0;

  for (const entry of entries) {
    if (!entry.timestamp) continue;
    const { day, hour } = toCell(entry.timestamp);
    matrix[day][hour]++;
    total++;
  }

  const max = Math.max(...matrix.flat());
  return { matrix, max, total };
}

/**
 * Flatten heatmap into row objects for formatting.
 */
function heatmapToRows(matrix) {
  return matrix.map((row, dayIdx) => ({
    day: DAYS[dayIdx],
    hours: row,
    rowTotal: row.reduce((a, b) => a + b, 0),
  }));
}

/**
 * Find the peak cell (busiest hour/day combo).
 */
function peakCell(matrix) {
  let best = { day: 0, hour: 0, count: 0 };
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (matrix[d][h] > best.count) {
        best = { day: DAYS[d], hour: h, count: matrix[d][h] };
      }
    }
  }
  return best;
}

/**
 * Summarize heatmap into a plain object.
 */
function summarizeHeatmap(entries) {
  const { matrix, max, total } = buildHeatmap(entries);
  const peak = peakCell(matrix);
  const rows = heatmapToRows(matrix);
  return { matrix, rows, max, total, peak };
}

module.exports = { buildHeatmap, heatmapToRows, peakCell, summarizeHeatmap, DAYS, HOURS };
