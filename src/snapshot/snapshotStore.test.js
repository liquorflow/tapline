const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveSnapshot, loadSnapshot, listSnapshots, deleteSnapshot } = require('./snapshotStore');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tapline-snap-'));

const entries = [
  { method: 'GET', path: '/x', status: 200, latency: 15 },
  { method: 'POST', path: '/y', status: 500, latency: 300 },
];

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('saveSnapshot writes file and returns snapshot', () => {
  const snap = saveSnapshot(entries, 'snap1', tmpDir);
  expect(snap.label).toBe('snap1');
  expect(snap.count).toBe(2);
  expect(fs.existsSync(path.join(tmpDir, 'snap1.json'))).toBe(true);
});

test('loadSnapshot reads saved snapshot', () => {
  saveSnapshot(entries, 'snap2', tmpDir);
  const snap = loadSnapshot('snap2', tmpDir);
  expect(snap.label).toBe('snap2');
  expect(snap.entries).toHaveLength(2);
});

test('loadSnapshot throws for missing snapshot', () => {
  expect(() => loadSnapshot('nope', tmpDir)).toThrow('Snapshot not found');
});

test('listSnapshots returns saved labels', () => {
  saveSnapshot(entries, 'snap3', tmpDir);
  const list = listSnapshots(tmpDir);
  expect(list).toContain('snap3');
});

test('deleteSnapshot removes the file', () => {
  saveSnapshot(entries, 'snap4', tmpDir);
  deleteSnapshot('snap4', tmpDir);
  expect(fs.existsSync(path.join(tmpDir, 'snap4.json'))).toBe(false);
});

test('deleteSnapshot is safe if file missing', () => {
  expect(() => deleteSnapshot('ghost', tmpDir)).not.toThrow();
});
