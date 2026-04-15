/**
 * diffFormatter.js
 * Format diff results for CLI output.
 */

const { colorizeStatus } = require('../formatter/outputFormatter');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';

/**
 * Format a full diff result into a printable string.
 *
 * @param {{ added: Object[], removed: Object[], changed: Object[] }} diff
 * @param {{ color?: boolean }} options
 * @returns {string}
 */
function formatDiff(diff, options = {}) {
  const { color = true } = options;
  const lines = [];

  if (diff.added.length > 0) {
    lines.push(color ? `${GREEN}+ Added (${diff.added.length})${RESET}` : `+ Added (${diff.added.length})`);
    for (const e of diff.added) {
      lines.push(formatEntry('+', e, color ? GREEN : null));
    }
  }

  if (diff.removed.length > 0) {
    lines.push(color ? `${RED}- Removed (${diff.removed.length})${RESET}` : `- Removed (${diff.removed.length})`);
    for (const e of diff.removed) {
      lines.push(formatEntry('-', e, color ? RED : null));
    }
  }

  if (diff.changed.length > 0) {
    lines.push(color ? `${YELLOW}~ Changed (${diff.changed.length})${RESET}` : `~ Changed (${diff.changed.length})`);
    for (const c of diff.changed) {
      lines.push(formatChanged(c, color));
    }
  }

  if (lines.length === 0) {
    return color ? `${DIM}No differences found.${RESET}` : 'No differences found.';
  }

  return lines.join('\n');
}

function formatEntry(prefix, entry, ansiColor) {
  const status = colorizeStatus(entry.status);
  const line = `  ${prefix} ${entry.method.padEnd(6)} ${entry.path.padEnd(30)} ${status} ${entry.duration}ms`;
  return ansiColor ? `${ansiColor}${line}${RESET}` : line;
}

function formatChanged(change, color) {
  const lines = [`  ~ ${change.key}`];
  for (const [field, { from, to }] of Object.entries(change.delta)) {
    const arrow = color ? `${DIM}→${RESET}` : '->';
    lines.push(`      ${field}: ${from} ${arrow} ${to}`);
  }
  return lines.join('\n');
}

module.exports = { formatDiff };
