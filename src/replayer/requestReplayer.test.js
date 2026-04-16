const { replayRequest, replayAll } = require('./requestReplayer');
const http = require('http');

let server;
let baseUrl;

beforeAll((done) => {
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ method: req.method, path: req.url, body }));
    });
  });
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

describe('replayRequest', () => {
  test('sends a GET request and returns response summary', async () => {
    const entry = { method: 'GET', path: '/hello', headers: {} };
    const result = await replayRequest(entry, { baseUrl });

    expect(result.status).toBe(200);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.originalEntry).toBe(entry);

    const parsed = JSON.parse(result.body);
    expect(parsed.method).toBe('GET');
    expect(parsed.path).toBe('/hello');
  });

  test('sends a POST request with body', async () => {
    const entry = {
      method: 'POST',
      path: '/submit',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ foo: 'bar' }),
    };
    const result = await replayRequest(entry, { baseUrl });

    expect(result.status).toBe(200);
    const parsed = JSON.parse(result.body);
    expect(parsed.method).toBe('POST');
    expect(parsed.body).toBe(JSON.stringify({ foo: 'bar' }));
  });

  test('throws when no URL is resolvable', async () => {
    const entry = { method: 'GET', headers: {} };
    await expect(replayRequest(entry, {})).rejects.toThrow('Cannot replay entry');
  });

  test('respects delayMs option', async () => {
    const entry = { method: 'GET', path: '/delay', headers: {} };
    const start = Date.now();
    await replayRequest(entry, { baseUrl, delayMs: 50 });
    expect(Date.now() - start).toBeGreaterThanOrEqual(50);
  });

  test('result includes durationMs as a number', async () => {
    const entry = { method: 'GET', path: '/timing', headers: {} };
    const result = await replayRequest(entry, { baseUrl });
    expect(typeof result.durationMs).toBe('number');
  });
});

describe('replayAll', () => {
  test('replays multiple entries and returns results array', async () => {
    const entries = [
      { method: 'GET', path: '/a', headers: {} },
      { method: 'GET', path: '/b', headers: {} },
    ];
    const results = await replayAll(entries, { baseUrl });

    expect(results).toHaveLength(2);
    results.forEach((r) => expect(r.success).toBe(true));
  });

  test('captures errors per entry without stopping replay', async () => {
    const entries = [
      { method: 'GET', headers: {} },
      { method: 'GET', path: '/ok', headers: {} },
    ];
    const results = await replayAll(entries, { baseUrl });

    expect(results[0].success).toBe(false);
    expect(results[0].error).toMatch('Cannot replay entry');
    expect(results[1].success).toBe(true);
  });

  test('returns empty array for empty entries list', async () => {
    const results = await replayAll([], { baseUrl });
    expect(results).toEqual([]);
  });
});
