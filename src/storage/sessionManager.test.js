jest.mock('./sessionStore');

const store = require('./sessionStore');
const { save, load, list, remove } = require('./sessionManager');

const sampleEntries = [
  { method: 'GET', path: '/health', status: 200, duration: 5 },
];

describe('save', () => {
  test('calls saveSession and returns success message', () => {
    store.saveSession.mockReturnValue('/home/user/.tapline/sessions/test.json');
    const result = save('test', sampleEntries);
    expect(store.saveSession).toHaveBeenCalledWith('test', sampleEntries);
    expect(result.success).toBe(true);
    expect(result.message).toContain('test');
    expect(result.message).toContain('1 entries');
  });

  test('throws when entries are empty', () => {
    expect(() => save('empty', [])).toThrow('No entries to save');
  });

  test('throws when entries are null', () => {
    expect(() => save('null-entries', null)).toThrow('No entries to save');
  });
});

describe('load', () => {
  test('returns parsed session data', () => {
    store.loadSession.mockReturnValue({
      name: 'my-session',
      savedAt: '2024-01-01T00:00:00.000Z',
      entries: sampleEntries,
    });
    const result = load('my-session');
    expect(result.success).toBe(true);
    expect(result.entries).toHaveLength(1);
    expect(result.message).toContain('my-session');
  });

  test('propagates errors from store', () => {
    store.loadSession.mockImplementation(() => { throw new Error('Session "x" not found'); });
    expect(() => load('x')).toThrow('Session "x" not found');
  });
});

describe('list', () => {
  test('returns session list message', () => {
    store.listSessions.mockReturnValue(['alpha', 'beta']);
    const result = list();
    expect(result.success).toBe(true);
    expect(result.sessions).toEqual(['alpha', 'beta']);
    expect(result.message).toContain('2 session');
  });

  test('returns empty message when no sessions', () => {
    store.listSessions.mockReturnValue([]);
    const result = list();
    expect(result.sessions).toEqual([]);
    expect(result.message).toContain('No sessions');
  });
});

describe('remove', () => {
  test('calls deleteSession and returns success', () => {
    store.deleteSession.mockReturnValue(true);
    const result = remove('old-session');
    expect(store.deleteSession).toHaveBeenCalledWith('old-session');
    expect(result.success).toBe(true);
    expect(result.message).toContain('old-session');
  });

  test('propagates errors from store', () => {
    store.deleteSession.mockImplementation(() => { throw new Error('Session "x" not found'); });
    expect(() => remove('x')).toThrow('Session "x" not found');
  });
});
