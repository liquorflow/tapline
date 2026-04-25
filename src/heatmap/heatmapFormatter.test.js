'use strict';

const { formatHeatmapGrid, formatHeatmapJson, formatHeatmapSummary, densityChar } = require('./heatmapFormatter');

function makeEntry(isoTimestamp) {
  return { timestamp: isoTimestamp, method: 'GET', path: '/', status: 200, duration: 10 };
}

const MON_9 = '2024-01-08T09:15:00Z';
const WED_14 = '2024-01-10T14:05:00Z';

describe('densityChar', () => {
  test('returns space for zero count', () => {
    expect(densityChar(0, 10)).toBe(' ');
  });

  test('returns full block for max', () => {
    expect(densityChar(10, 10)).toBe('█');
  });

  test('returns space when max is 0', () => {
    expect(densityChar(0, 0)).toBe(' ');
  });
});

describe('formatHeatmapGrid', () => {
  test('returns a multi-line string', () => {
    const entries = [makeEntry(MON_9), makeEntry(WED_14)];
    const grid = formatHeatmapGrid(entries);
    expect(typeof grid).toBe('string');
    const lines = grid.split('\n');
    // header + 7 day rows
    expect(lines).toHaveLength(8);
  });

  test('includes all day labels', () => {
    const grid = formatHeatmapGrid([makeEntry(MON_9)]);
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
      expect(grid).toContain(day);
    });
  });

  test('works with empty entries', () => {
    const grid = formatHeatmapGrid([]);
    expect(grid).toBeTruthy();
  });
});

describe('formatHeatmapJson', () => {
  test('returns valid JSON', () => {
    const json = formatHeatmapJson([makeEntry(MON_9)]);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  test('JSON contains expected fields', () => {
    const obj = JSON.parse(formatHeatmapJson([makeEntry(MON_9)]));
    expect(obj).toHaveProperty('total', 1);
    expect(obj).toHaveProperty('peak');
    expect(obj).toHaveProperty('rows');
    expect(obj.rows).toHaveLength(7);
  });
});

describe('formatHeatmapSummary', () => {
  test('returns no-entries message for empty input', () => {
    expect(formatHeatmapSummary([])).toMatch(/no entries/i);
  });

  test('includes total and peak info', () => {
    const entries = [makeEntry(MON_9), makeEntry(MON_9)];
    const summary = formatHeatmapSummary(entries);
    expect(summary).toContain('2 requests');
    expect(summary).toContain('Mon');
    expect(summary).toContain('9:00');
  });
});
