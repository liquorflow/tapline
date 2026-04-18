// logChainer.js — chainable wrapper for pipeline-style log processing

class LogChain {
  constructor(entries) {
    this._entries = entries || [];
  }

  static from(entries) {
    return new LogChain(entries);
  }

  filter(fn) {
    this._entries = this._entries.filter(fn);
    return this;
  }

  map(fn) {
    this._entries = this._entries.map(fn);
    return this;
  }

  sort(fn) {
    this._entries = [...this._entries].sort(fn);
    return this;
  }

  limit(n) {
    this._entries = this._entries.slice(0, n);
    return this;
  }

  skip(n) {
    this._entries = this._entries.slice(n);
    return this;
  }

  unique(keyFn) {
    const seen = new Set();
    this._entries = this._entries.filter(e => {
      const k = keyFn ? keyFn(e) : JSON.stringify(e);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    return this;
  }

  tap(fn) {
    this._entries.forEach(fn);
    return this;
  }

  groupBy(keyFn) {
    return this._entries.reduce((acc, e) => {
      const k = keyFn(e);
      (acc[k] = acc[k] || []).push(e);
      return acc;
    }, {});
  }

  toArray() {
    return this._entries;
  }

  count() {
    return this._entries.length;
  }

  first() {
    return this._entries[0] || null;
  }

  last() {
    return this._entries[this._entries.length - 1] || null;
  }
}

module.exports = { LogChain };
