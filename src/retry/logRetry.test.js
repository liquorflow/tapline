const { isRetryable, retryRequest, retryAll, summarizeRetries } = require('./logRetry');

const mockEntry = { method: 'GET', path: '/api/test', status: 200 };

describe('isRetryable', () => {
  test('returns true for status 500', () => {
    expect(isRetryable({ status: 500 })).toBe(true);
  });

  test('returns true for status 0', () => {
    expect(isRetryable({ status: 0 })).toBe(true);
  });

  test('returns false for status 200', () => {
    expect(isRetryable({ status: 200 })).toBe(false);
  });

  test('returns false for null', () => {
    expect(isRetryable(null)).toBe(false);
  });
});

describe('retryRequest', () => {
  test('returns success on first try', async () => {
    const requester = jest.fn().mockResolvedValue({ status: 200 });
    const result = await retryRequest(mockEntry, requester, { delayMs: 0 });
    expect(result.success).toBe(true);
    expect(result.attempts).toBe(1);
  });

  test('retries on 500 and eventually succeeds', async () => {
    const requester = jest.fn()
      .mockResolvedValueOnce({ status: 500 })
      .mockResolvedValueOnce({ status: 200 });
    const result = await retryRequest(mockEntry, requester, { maxRetries: 3, delayMs: 0 });
    expect(result.success).toBe(true);
    expect(result.attempts).toBe(2);
  });

  test('fails after max retries', async () => {
    const requester = jest.fn().mockResolvedValue({ status: 503 });
    const result = await retryRequest(mockEntry, requester, { maxRetries: 2, delayMs: 0 });
    expect(result.success).toBe(false);
    expect(result.attempts).toBe(3);
  });

  test('handles thrown errors', async () => {
    const requester = jest.fn().mockRejectedValue(new Error('network error'));
    const result = await retryRequest(mockEntry, requester, { maxRetries: 1, delayMs: 0 });
    expect(result.success).toBe(false);
    expect(result.result.error).toBe('network error');
  });
});

describe('retryAll', () => {
  test('processes all entries', async () => {
    const entries = [mockEntry, mockEntry];
    const requester = jest.fn().mockResolvedValue({ status: 200 });
    const results = await retryAll(entries, requester, { delayMs: 0 });
    expect(results).toHaveLength(2);
    expect(results.every(r => r.success)).toBe(true);
  });
});

describe('summarizeRetries', () => {
  test('summarizes results correctly', () => {
    const results = [
      { success: true, attempts: 1 },
      { success: false, attempts: 3 },
      { success: true, attempts: 2 },
    ];
    const summary = summarizeRetries(results);
    expect(summary.total).toBe(3);
    expect(summary.succeeded).toBe(2);
    expect(summary.failed).toBe(1);
    expect(summary.totalAttempts).toBe(6);
  });
});
