/**
 * sessionManager.js
 * High-level API for session management — wraps sessionStore with
 * user-friendly output and integrates with parsed log entries.
 */

const { saveSession, loadSession, listSessions, deleteSession } = require('./sessionStore');

function save(name, entries) {
  if (!entries || entries.length === 0) {
    throw new Error('No entries to save — check your log file or filters');
  }
  const filePath = saveSession(name, entries);
  return { success: true, message: `Session "${name}" saved (${entries.length} entries) → ${filePath}` };
}

function load(name) {
  const session = loadSession(name);
  return {
    success: true,
    name: session.name,
    savedAt: session.savedAt,
    entries: session.entries,
    message: `Loaded session "${name}" with ${session.entries.length} entries (saved ${session.savedAt})`,
  };
}

function list() {
  const names = listSessions();
  if (names.length === 0) {
    return { success: true, sessions: [], message: 'No sessions found.' };
  }
  return {
    success: true,
    sessions: names,
    message: `Found ${names.length} session(s): ${names.join(', ')}`,
  };
}

function remove(name) {
  deleteSession(name);
  return { success: true, message: `Session "${name}" deleted.` };
}

module.exports = { save, load, list, remove };
