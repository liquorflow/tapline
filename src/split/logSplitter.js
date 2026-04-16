// logSplitter.js — split log entries into chunks or partitions

/**
 * Split entries into chunks of size n
 * @param {object[]} entries
 * @param {number} size
 * @returns {object[][]}
 */
function chunkEntries(entries, size) {
  if (!size || size < 1) throw new Error('chunk size must be >= 1');
  const chunks = [];
  for (let i = 0; i < entries.length; i += size) {
    chunks.push(entries.slice(i, i + size));
  }
  return chunks;
}

/**
 * Split entries into n roughly equal partitions
 * @param {object[]} entries
 * @param {number} n
 * @returns {object[][]}
 */
function partitionEntries(entries, n) {
  if (!n || n < 1) throw new Error('partition count must be >= 1');
  const size = Math.ceil(entries.length / n);
  return chunkEntries(entries, size);
}

/**
 * Split entries by a field value (e.g. method, status)
 * @param {object[]} entries
 * @param {string} field
 * @returns {Object.<string, object[]>}
 */
function splitByField(entries, field) {
  const result = {};
  for (const entry of entries) {
    const key = String(entry[field] ?? 'unknown');
    if (!result[key]) result[key] = [];
    result[key].push(entry);
  }
  return result;
}

/**
 * Split entries at a specific index into [before, after]
 * @param {object[]} entries
 * @param {number} index
 * @returns {[object[], object[]]}
 */
function splitAt(entries, index) {
  return [entries.slice(0, index), entries.slice(index)];
}

/**
 * High-level split dispatcher
 */
function splitEntries(entries, options = {}) {
  const { mode = 'chunk', size, n, field, index } = options;
  if (mode === 'chunk') return chunkEntries(entries, size ?? 10);
  if (mode === 'partition') return partitionEntries(entries, n ?? 2);
  if (mode === 'field') return splitByField(entries, field ?? 'method');
  if (mode === 'at') return splitAt(entries, index ?? 0);
  throw new Error(`unknown split mode: ${mode}`);
}

module.exports = { chunkEntries, partitionEntries, splitByField, splitAt, splitEntries };
