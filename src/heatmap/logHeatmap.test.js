'use strict';

const { buildHeatmap, heatmapToRows, peakCell, summarizeHeatmap, DAYS } = require('./logHeatmap');

function makeEntry(isoTimestamp) {
  return { timestamp: isoTimestamp, method: 'GET', path: '/', status: 200, duration: 10 };
}

// Monday 09:00 UTC
const MON_9 = '2024-01-08T09:15:00Z';
// Monday 09:30 UTC
const MON_9B = '2024-01-08T09:45:00Z';
// Wednesday 14:00 UTC
const WED_14 = '2024-01-10T14:05:00Z';

describe('buildHeatmap', () => {
  test('returns 7x24 matrix', () => {
    const { matrix } = buildHeatmap([]);
    expect(matrix).toHaveLength(7);
    matrix.forEach(row => expect(row).toHaveLength(24));
  });

  test('counts entries in correct cell', () => {
    const entries = [makeEntry(MON_9), makeEntry(MON_9B), makeEntry(WED_14)];
    const { matrix, total } = buildHeatmap(entries);
    // Monday = day 1, hour 9
    expect(matrix[1][9]).toBe(2);
    // Wednesday = day 3, hour 14
    expect(matrix[3][14]).toBe(1);
    expect(total).toBe(3);
  });

  test('skips entries without timestamp', () => {
    const { total } = buildHeatmap([{ method: 'GET' }]);
    expect(total).toBe(0);
  });

  test('max reflects highest cell count', () => {
    const entries = [makeEntry(MON_9), makeEntry(MON_9B)];
    const { max } = buildHeatmap(entries);
    expect(max).toBe(2);
  });
});

describe('heatmapToRows', () => {
  test('produces 7 rows with day labels', () => {
    const { matrix } = buildHeatmap([]);
    const rows = heatmapToRows(matrix);
    expect(rows).toHaveLength(7);
    expect(rows.map(r => r.day)).toEqual(DAYS);
  });

  test('rowTotal sums correctly', () => {
    const entries = [makeEntry(MON_9), makeEntry(MON_9B)];
    const { matrix } = buildHeatmap(entries);
    const rows = heatmapToRows(matrix);
    expect(rows[1].rowTotal).toBe(2);
  });
});

describe('peakCell', () => {
  test('returns busiest day/hour', () => {
    const entries = [makeEntry(MON_9), makeEntry(MON_9B), makeEntry(WED_14)];
    const { matrix } = buildHeatmap(entries);
    const peak = peakCell(matrix);
    expect(peak.day).toBe('Mon');
    expect(peak.hour).toBe(9);
    expect(peak.count).toBe(2);
  });

  test('returns zeros for empty matrix', () => {
    const { matrix } = buildHeatmap([]);
    const peak = peakCell(matrix);
    expect(peak.count).toBe(0);
  });
});

describe('summarizeHeatmap', () => {
  test('returns matrix, rows, max, total, peak', () => {
    const entries = [makeEntry(MON_9)];
    const result = summarizeHeatmap(entries);
    expect(result).toHaveProperty('matrix');
    expect(result).toHaveProperty('rows');
    expect(result).toHaveProperty('max');
    expect(result).toHaveProperty('total', 1);
    expect(result).toHaveProperty('peak');
  });
});
