// snapshotStore.js — in-memory + file-backed store for named snapshots

const fs = require('fs');
const path = require('path');
const { takeSnapshot } = require('./logSnapshot');

const DEFAULT_DIR = path.join(process.env.HOME || '/tmp', '.tapline', 'snapshots');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function saveSnapshot(entries, label, dir = DEFAULT_DIR) {
  ensureDir(dir);
  const snap = takeSnapshot(entries, label);
  const file = path.join(dir, `${label}.json`);
  fs.writeFileSync(file, JSON.stringify(snap, null, 2));
  return snap;
}

function loadSnapshot(label, dir = DEFAULT_DIR) {
  const file = path.join(dir, `${label}.json`);
  if (!fs.existsSync(file)) throw new Error(`Snapshot not found: ${label}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listSnapshots(dir = DEFAULT_DIR) {
  ensureDir(dir);
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

function deleteSnapshot(label, dir = DEFAULT_DIR) {
  const file = path.join(dir, `${label}.json`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

module.exports = { saveSnapshot, loadSnapshot, listSnapshots, deleteSnapshot };
