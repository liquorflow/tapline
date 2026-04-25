'use strict';

const { createQueue, fillQueue } = require('./replayQueue');

const entry = (method, path, extra = {}) => ({ method, path, status: 200, duration: 50, ...extra });

describe('createQueue', () => {
  test('enqueues and dequeues entries in FIFO order', () => {
    const q = createQueue();
    q.enqueue(entry('GET', '/a'));
    q.enqueue(entry('POST', '/b'));
    expect(q.dequeue().path).toBe('/a');
    expect(q.dequeue().path).toBe('/b');
    expect(q.dequeue()).toBeNull();
  });

  test('size and isEmpty reflect queue state', () => {
    const q = createQueue();
    expect(q.isEmpty()).toBe(true);
    q.enqueue(entry('GET', '/x'));
    expect(q.size()).toBe(1);
    expect(q.isEmpty()).toBe(false);
  });

  test('peek returns first item without removing it', () => {
    const q = createQueue();
    q.enqueue(entry('GET', '/peek'));
    expect(q.peek().path).toBe('/peek');
    expect(q.size()).toBe(1);
  });

  test('respects maxSize limit', () => {
    const q = createQueue({ maxSize: 2 });
    expect(q.enqueue(entry('GET', '/1'))).toBe(true);
    expect(q.enqueue(entry('GET', '/2'))).toBe(true);
    expect(q.enqueue(entry('GET', '/3'))).toBe(false);
    expect(q.size()).toBe(2);
  });

  test('dedupe skips duplicate method+path combos', () => {
    const q = createQueue({ dedupe: true });
    expect(q.enqueue(entry('GET', '/dup'))).toBe(true);
    expect(q.enqueue(entry('GET', '/dup'))).toBe(false);
    expect(q.enqueue(entry('POST', '/dup'))).toBe(true);
    expect(q.size()).toBe(2);
  });

  test('clear empties the queue and resets dedupe state', () => {
    const q = createQueue({ dedupe: true });
    q.enqueue(entry('GET', '/clear'));
    q.clear();
    expect(q.isEmpty()).toBe(true);
    expect(q.enqueue(entry('GET', '/clear'))).toBe(true);
  });

  test('toArray returns copy without mutating queue', () => {
    const q = createQueue();
    q.enqueue(entry('GET', '/arr'));
    const arr = q.toArray();
    expect(arr).toHaveLength(1);
    expect(q.size()).toBe(1);
  });

  test('drainAll returns all items and empties queue', () => {
    const q = createQueue();
    q.enqueue(entry('GET', '/d1'));
    q.enqueue(entry('GET', '/d2'));
    const drained = q.drainAll();
    expect(drained).toHaveLength(2);
    expect(q.isEmpty()).toBe(true);
  });

  test('enqueued entries have _queuedAt timestamp', () => {
    const q = createQueue();
    q.enqueue(entry('GET', '/ts'));
    expect(q.peek()._queuedAt).toBeDefined();
    expect(typeof q.peek()._queuedAt).toBe('number');
  });
});

describe('fillQueue', () => {
  test('fills queue from array and reports skipped', () => {
    const entries = [
      entry('GET', '/a'),
      entry('POST', '/b'),
      entry('GET', '/c')
    ];
    const { queue, skipped } = fillQueue(entries, { maxSize: 2 });
    expect(queue.size()).toBe(2);
    expect(skipped).toBe(1);
  });

  test('fills with dedupe enabled', () => {
    const entries = [
      entry('GET', '/x'),
      entry('GET', '/x'),
      entry('GET', '/y')
    ];
    const { queue, skipped } = fillQueue(entries, { dedupe: true });
    expect(queue.size()).toBe(2);
    expect(skipped).toBe(1);
  });
});
