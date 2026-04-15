/**
 * sessionStore.js
 * Manages saving and loading replay sessions to/from disk.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_STORE_DIR = path.join(os.homedir(), '.tapline', 'sessions');

function ensureStoreDir(dir = DEFAULT_STORE_DIR) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function saveSession(name, entries, dir = DEFAULT_STORE_DIR) {
  if (!name || typeof name !== 'string') throw new Error('Session name is required');
  if (!Array.isArray(entries)) throw new Error('Entries must be an array');

  ensureStoreDir(dir);
  const filePath = path.join(dir, `${name}.json`);
  const session = {
    name,
    savedAt: new Date().toISOString(),
    entries,
  };
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf8');
  return filePath;
}

function loadSession(name, dir = DEFAULT_STORE_DIR) {
  if (!name || typeof name !== 'string') throw new Error('Session name is required');

  const filePath = path.join(dir, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Session "${name}" not found at ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function listSessions(dir = DEFAULT_STORE_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''));
}

function deleteSession(name, dir = DEFAULT_STORE_DIR) {
  if (!name || typeof name !== 'string') throw new Error('Session name is required');

  const filePath = path.join(dir, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Session "${name}" not found`);
  }
  fs.unlinkSync(filePath);
  return true;
}

module.exports = { saveSession, loadSession, listSessions, deleteSession, ensureStoreDir };
