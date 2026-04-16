const fs = require('fs');
const os = require('os');
const path = require('path');
const { watchLog } = require('./logWatcher');

function tmpFile() {
  return path.join(os.tmpdir(), `tapline-watch-${Date.now()}.log`);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('watchLog', () => {
  let filePath;

  beforeEach(() => {
    filePath = tmpFile();
    fs.writeFileSync(filePath, '');
  });

  afterEach(() => {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  test('throws if file does not exist', () => {
    expect(() => watchLog('/nonexistent/file.log', () => {})).toThrow('File not found');
  });

  test('calls onEntry when a valid log line is appended', async () => {
    const entries = [];
    const watcher = watchLog(filePath, (entry) => entries.push(entry), { pollInterval: 50 });

    await delay(60);
    fs.appendFileSync(filePath, 'GET /api/users 200 123ms\n');
    await delay(120);

    watcher.stop();
    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries[0]).toHaveProperty('method', 'GET');
    expect(entries[0]).toHaveProperty('path', '/api/users');
  });

  test('handles multiple lines appended at once', async () => {
    const entries = [];
    const watcher = watchLog(filePath, (entry) => entries.push(entry), { pollInterval: 50 });

    await delay(60);
    fs.appendFileSync(filePath, 'POST /login 201 45ms\nDELETE /item/1 204 30ms\n');
    await delay(120);

    watcher.stop();
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  test('stop() prevents further callbacks', async () => {
    const entries = [];
    const watcher = watchLog(filePath, (entry) => entries.push(entry), { pollInterval: 50 });

    watcher.stop();
    await delay(60);
    fs.appendFileSync(filePath, 'GET /stopped 200 10ms\n');
    await delay(120);

    expect(entries.length).toBe(0);
  });

  test('ignores blank lines', async () => {
    const entries = [];
    const watcher = watchLog(filePath, (entry) => entries.push(entry), { pollInterval: 50 });

    await delay(60);
    fs.appendFileSync(filePath, '\n\n\n');
    await delay(120);

    watcher.stop();
    expect(entries.length).toBe(0);
  });
});
