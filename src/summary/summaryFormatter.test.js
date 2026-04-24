'use strict';

const { formatSummaryText, formatSummaryJson, formatSummaryOneLine } = require('./summaryFormatter');
const { buildSummary } = require('./logSummary');

const makeEntry = (method, status, duration) => ({
  method, status, duration, timestamp: '2024-01-01T00:00:00Z', path: '/test',
});

const sampleEntries = [
  makeEntry('GET', 200, 80),
  makeEntry('GET', 200, 120),
  makeEntry('POST', 500, 400),
];

describe('formatSummaryText', () => {
  test('returns message for empty summary', () => {
    const s = buildSummary([]);
    expect(formatSummaryText(s)).toBe('No log entries to summarize.');
  });

  test('includes total requests', () => {
    const s = buildSummary(sampleEntries);
    const out = formatSummaryText(s);
    expect(out).toContain('Total Requests : 3');
  });

  test('includes error rate line', () => {
    const s = buildSummary(sampleEntries);
    const out = formatSummaryText(s);
    expect(out).toContain('Error Rate');
  });

  test('includes latency line', () => {
    const s = buildSummary(sampleEntries);
    const out = formatSummaryText(s);
    expect(out).toContain('Latency');
    expect(out).toContain('p50=');
    expect(out).toContain('p99=');
  });

  test('includes method breakdown', () => {
    const s = buildSummary(sampleEntries);
    const out = formatSummaryText(s);
    expect(out).toContain('GET=');
    expect(out).toContain('POST=');
  });

  test('includes status breakdown', () => {
    const s = buildSummary(sampleEntries);
    const out = formatSummaryText(s);
    expect(out).toContain('200=');
    expect(out).toContain('500=');
  });
});

describe('formatSummaryJson', () => {
  test('returns valid JSON', () => {
    const s = buildSummary(sampleEntries);
    const json = formatSummaryJson(s);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  test('JSON contains total', () => {
    const s = buildSummary(sampleEntries);
    const parsed = JSON.parse(formatSummaryJson(s));
    expect(parsed.total).toBe(3);
  });
});

describe('formatSummaryOneLine', () => {
  test('returns no-entries string for empty summary', () => {
    const s = buildSummary([]);
    expect(formatSummaryOneLine(s)).toBe('No entries.');
  });

  test('contains key fields separated by pipe', () => {
    const s = buildSummary(sampleEntries);
    const line = formatSummaryOneLine(s);
    expect(line).toContain('total=3');
    expect(line).toContain('errors=');
    expect(line).toContain('p50=');
    expect(line).toContain('outliers=');
  });
});
