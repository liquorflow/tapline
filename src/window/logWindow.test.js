const { slidingWindow, tumblingWindows, summarizeWindows } = require('./logWindow');

const entries = [
  { timestamp: '2024-01-01T00:00:00.000Z', method: 'GET', path: '/a', status: 200, duration: 100 },
  { timestamp: '2024-01-01T00:00:05.000Z', method: 'POST', path: '/b', status: 201, duration: 200 },
  { timestamp: '2024-01-01T00:00:12.000Z', method: 'GET', path: '/c', status: 500, duration: 300 },
  { timestamp: '2024-01-01T00:00:18.000Z', method: 'DELETE', path: '/d', status: 404, duration: 50 },
];

describe('slidingWindow', () => {
  test('returns one result per entry', () => {
    const result = slidingWindow(entries, 10000);
    expect(result).toHaveLength(entries.length);
  });

  test('anchor matches source entry', () => {
    const result = slidingWindow(entries, 10000);
    expect(result[0].anchor).toBe(entries[0]);
  });

  test('window includes entries within duration', () => {
    const result = slidingWindow(entries, 10000);
    // entry at index 2 (t=12s): window covers 2s–12s, includes entries at 5s and 12s
    expect(result[2].window).toHaveLength(2);
  });

  test('window of 0ms includes only the anchor', () => {
    const result = slidingWindow(entries, 0);
    expect(result[0].window).toHaveLength(1);
  });
});

describe('tumblingWindows', () => {
  test('returns empty for empty input', () => {
    expect(tumblingWindows([], 10000)).toEqual([]);
  });

  test('groups entries into correct windows', () => {
    const windows = tumblingWindows(entries, 10000);
    // first window 0-10s: entries at 0s and 5s
    expect(windows[0].entries).toHaveLength(2);
  });

  test('each window has a start timestamp', () => {
    const windows = tumblingWindows(entries, 10000);
    expect(typeof windows[0].start).toBe('string');
  });

  test('all entries are accounted for', () => {
    const windows = tumblingWindows(entries, 10000);
    const total = windows.reduce((s, w) => s + w.entries.length, 0);
    expect(total).toBe(entries.length);
  });
});

describe('summarizeWindows', () => {
  test('produces summary per window', () => {
    const windows = tumblingWindows(entries, 10000);
    const summary = summarizeWindows(windows);
    expect(summary[0]).toHaveProperty('count');
    expect(summary[0]).toHaveProperty('avgLatency');
    expect(summary[0]).toHaveProperty('errorCount');
  });

  test('counts errors correctly', () => {
    const windows = tumblingWindows(entries, 20000);
    const summary = summarizeWindows(windows);
    // entries at 0,5,12 in first window; status 500 is 1 error
    const errors = summary.reduce((s, w) => s + w.errorCount, 0);
    expect(errors).toBe(2); // 500 and 404
  });
});
