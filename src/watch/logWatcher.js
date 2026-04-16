const fs = require('fs');
const path = require('path');
const { parseLine } = require('../parser/logParser');

/**
 * Watch a log file for new lines and emit parsed entries.
 * @param {string} filePath - Path to the log file to watch.
 * @param {function} onEntry - Callback invoked with each new parsed entry.
 * @param {object} [options]
 * @param {number} [options.pollInterval=500] - Polling interval in ms.
 * @returns {{ stop: function }} - Object with a stop() method.
 */
function watchLog(filePath, onEntry, options = {}) {
  const pollInterval = options.pollInterval || 500;
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  let lastSize = fs.statSync(resolved).size;

  const interval = setInterval(() => {
    try {
      const stat = fs.statSync(resolved);
      const currentSize = stat.size;

      if (currentSize === lastSize) return;

      if (currentSize < lastSize) {
        // File was truncated/rotated
        lastSize = 0;
      }

      const stream = fs.createReadStream(resolved, {
        start: lastSize,
        end: currentSize - 1,
        encoding: 'utf8',
      });

      let buffer = '';
      stream.on('data', (chunk) => {
        buffer += chunk;
      });

      stream.on('end', () => {
        const lines = buffer.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          const entry = parseLine(trimmed);
          if (entry) onEntry(entry);
        }
        lastSize = currentSize;
      });
    } catch (err) {
      // Ignore transient errors (e.g. file briefly unavailable)
    }
  }, pollInterval);

  return {
    stop() {
      clearInterval(interval);
    },
  };
}

module.exports = { watchLog };
