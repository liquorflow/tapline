const fs = require('fs');
const path = require('path');
const os = require('os');
const { exportToCsv, exportToNdjson, exportToText, exportEntries } = require('./logExporter');

const sampleEntries = [
  { method: 'GET',  path: '/api/users',   status: 200, duration: 45,  timestamp: '2024-01-01T10:00:00Z' },
  { method: 'POST', path: '/api/orders',  status: 201, duration: 120, timestamp: '2024-01-01T10:01:00Z' },
  { method: 'GET',  path: '/api/missing', status: 404, duration: 10,  timestamp: '2024-01-01T10:02:00Z' }
];

function tmpFile(ext) {
  return path.join(os.tmpdir(), `tapline-test-${Date.now()}.${ext}`);
}

afterEach(() => {
  // cleanup handled per test
});

describe('exportToCsv', () => {
  test('writes a valid CSV file', () => {
    const out = tmpFile('csv');
    exportToCsv(sampleEntries, out);
    const content = fs.readFileSync(out, 'utf8');
    expect(content).toContain('method,path,status');
    expect(content).toContain('GET');
    expect(content).toContain('/api/users');
    fs.unlinkSync(out);
  });

  test('throws when entries are empty', () => {
    expect(() => exportToCsv([], tmpFile('csv'))).toThrow('No entries to export');
  });

  test('escapes double quotes in field values', () => {
    const tricky = [{ method: 'GET', path: '/say/"hello"', status: 200, duration: 5, timestamp: 't' }];
    const out = tmpFile('csv');
    exportToCsv(tricky, out);
    const content = fs.readFileSync(out, 'utf8');
    expect(content).toContain('""hello""');
    fs.unlinkSync(out);
  });
});

describe('exportToNdjson', () => {
  test('writes one JSON object per line', () => {
    const out = tmpFile('ndjson');
    exportToNdjson(sampleEntries, out);
    const lines = fs.readFileSync(out, 'utf8').trim().split('\n');
    expect(lines).toHaveLength(3);
    expect(JSON.parse(lines[0])).toMatchObject({ method: 'GET', status: 200 });
    fs.unlinkSync(out);
  });

  test('throws when entries are empty', () => {
    expect(() => exportToNdjson([], tmpFile('ndjson'))).toThrow('No entries to export');
  });
});

describe('exportToText', () => {
  test('writes human-readable lines', () => {
    const out = tmpFile('txt');
    exportToText(sampleEntries, out);
    const content = fs.readFileSync(out, 'utf8');
    expect(content).toContain('GET /api/users 200');
    expect(content).toContain('POST /api/orders 201');
    fs.unlinkSync(out);
  });

  test('throws when entries are empty', () => {
    expect(() => exportToText([], tmpFile('txt'))).toThrow('No entries to export');
  });
});

describe('exportEntries', () => {
  test('delegates to correct exporter based on format', () => {
    const out = tmpFile('csv');
    exportEntries(sampleEntries, out, 'csv');
    expect(fs.existsSync(out)).toBe(true);
    fs.unlinkSync(out);
  });

  test('throws on unsupported format', () => {
    expect(() => exportEntries(sampleEntries, tmpFile('xml'), 'xml'))
      .toThrow('Unsupported export format: xml');
  });
});
