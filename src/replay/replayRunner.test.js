import { describe, it, expect, vi, beforeEach } from 'vitest';
import { printSummary } from './replayRunner.js';

describe('printSummary', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('prints total, success, and failure counts', () => {
    const results = [
      { status: 200, url: '/api/a', duration: 120 },
      { status: 201, url: '/api/b', duration: 80 },
      { status: 500, url: '/api/c', duration: 300 },
    ];
    printSummary(results);
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('3');
    expect(output).toContain('2');
    expect(output).toContain('1');
  });

  it('handles empty results gracefully', () => {
    expect(() => printSummary([])).not.toThrow();
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('0');
  });

  it('marks all as success when no failures', () => {
    const results = [
      { status: 200, url: '/ok', duration: 50 },
      { status: 204, url: '/no-content', duration: 40 },
    ];
    printSummary(results);
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toMatch(/fail.*0|0.*fail/i);
  });

  it('includes average duration in output', () => {
    const results = [
      { status: 200, url: '/a', duration: 100 },
      { status: 200, url: '/b', duration: 200 },
    ];
    printSummary(results);
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('150');
  });

  it('counts 4xx and 5xx as failures', () => {
    const results = [
      { status: 404, url: '/missing', duration: 60 },
      { status: 503, url: '/down', duration: 90 },
      { status: 200, url: '/ok', duration: 70 },
    ];
    printSummary(results);
    const output = consoleSpy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('2');
  });
});
