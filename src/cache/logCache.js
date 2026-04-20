// logCache.js — simple in-memory cache for parsed/filtered log entries

const DEFAULT_TTL_MS = 60_000;

function makeKey(parts) {
  return parts.map(String).join(':');
}

function createCache(ttlMs = DEFAULT_TTL_MS) {
  const store = new Map();

  function set(key, value) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  function get(key) {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  function has(key) {
    return get(key) !== undefined;
  }

  function del(key) {
    store.delete(key);
  }

  function clear() {
    store.clear();
  }

  function size() {
    return store.size;
  }

  function evictExpired() {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of store.entries()) {
      if (now > entry.expiresAt) {
        store.delete(key);
        count++;
      }
    }
    return count;
  }

  function stats() {
    const now = Date.now();
    let active = 0;
    let expired = 0;
    for (const entry of store.values()) {
      now > entry.expiresAt ? expired++ : active++;
    }
    return { active, expired, total: store.size };
  }

  return { set, get, has, del, clear, size, evictExpired, stats, makeKey };
}

module.exports = { createCache, makeKey };
