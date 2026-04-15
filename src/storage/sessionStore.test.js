const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveSession, loadSession, listSessions, deleteSession, ensureStoreDir } = require('./sessionStore');

const TEST_DIR = path.join(os.tmpdir(), 'tapline-test-sessions-' + Date.now());

afterEach(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.readdirSync(TEST_DIR).forEach(f => fs.unlinkSync(path.join(TEST_DIR, f)));
    fs.rmdirSync(TEST_DIR);
  }
});

const sampleEntries = [
  { method: 'GET', path: '/api/users', status: 200, duration: 45 },
  { method: 'POST', path: '/api/login', status: 401, duration: 12 },
];

describe('ensureStoreDir', () => {
  test('creates directory if it does not exist', () => {
    ensureStoreDir(TEST_DIR);
    expect(fs.existsSync(TEST_DIR)).toBe(true);
  });
});

describe('saveSession', () => {
  test('saves a session file and returns its path', () => {
    const filePath = saveSession('my-session', sampleEntries, TEST_DIR);
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('throws if name is missing', () => {
    expect(() => saveSession('', sampleEntries, TEST_DIR)).toThrow('Session name is required');
  });

  test('throws if entries is not an array', () => {
    expect(() => saveSession('bad', null, TEST_DIR)).toThrow('Entries must be an array');
  });
});

describe('loadSession', () => {
  test('loads a previously saved session', () => {
    saveSession('load-test', sampleEntries, TEST_DIR);
    const session = loadSession('load-test', TEST_DIR);
    expect(session.name).toBe('load-test');
    expect(session.entries).toHaveLength(2);
    expect(session.savedAt).toBeDefined();
  });

  test('throws if session does not exist', () => {
    expect(() => loadSession('ghost', TEST_DIR)).toThrow('Session "ghost" not found');
  });
});

describe('listSessions', () => {
  test('returns empty array when no sessions exist', () => {
    expect(listSessions(TEST_DIR)).toEqual([]);
  });

  test('returns session names', () => {
    saveSession('alpha', sampleEntries, TEST_DIR);
    saveSession('beta', sampleEntries, TEST_DIR);
    const list = listSessions(TEST_DIR);
    expect(list).toContain('alpha');
    expect(list).toContain('beta');
  });
});

describe('deleteSession', () => {
  test('deletes an existing session', () => {
    saveSession('to-delete', sampleEntries, TEST_DIR);
    expect(deleteSession('to-delete', TEST_DIR)).toBe(true);
    expect(listSessions(TEST_DIR)).not.toContain('to-delete');
  });

  test('throws if session does not exist', () => {
    expect(() => deleteSession('nope', TEST_DIR)).toThrow('Session "nope" not found');
  });
});
