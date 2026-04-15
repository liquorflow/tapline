/**
 * CLI option definitions and argument parser for tapline.
 * Uses minimist-style parsing to keep dependencies minimal.
 */

const VALID_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const VALID_FORMATS = ['pretty', 'table', 'json'];

const defaults = {
  method: null,
  status: null,
  path: null,
  format: 'pretty',
  replay: false,
  delay: 0,
  help: false,
};

function parseArgs(argv = process.argv.slice(2)) {
  const options = { ...defaults };
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--replay' || arg === '-r') {
      options.replay = true;
    } else if ((arg === '--method' || arg === '-m') && argv[i + 1]) {
      const val = argv[++i].toUpperCase();
      if (!VALID_METHODS.includes(val)) {
        throw new Error(`Invalid method: ${val}. Must be one of: ${VALID_METHODS.join(', ')}`);
      }
      options.method = val;
    } else if ((arg === '--status' || arg === '-s') && argv[i + 1]) {
      const val = parseInt(argv[++i], 10);
      if (isNaN(val) || val < 100 || val > 599) {
        throw new Error(`Invalid status code: ${argv[i]}`);
      }
      options.status = val;
    } else if ((arg === '--path' || arg === '-p') && argv[i + 1]) {
      options.path = argv[++i];
    } else if ((arg === '--format' || arg === '-f') && argv[i + 1]) {
      const val = argv[++i].toLowerCase();
      if (!VALID_FORMATS.includes(val)) {
        throw new Error(`Invalid format: ${val}. Must be one of: ${VALID_FORMATS.join(', ')}`);
      }
      options.format = val;
    } else if ((arg === '--delay' || arg === '-d') && argv[i + 1]) {
      const val = parseInt(argv[++i], 10);
      if (isNaN(val) || val < 0) {
        throw new Error(`Invalid delay: must be a non-negative integer (ms)`);
      }
      options.delay = val;
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  options.file = positional[0] || null;
  return options;
}

function printHelp() {
  console.log(`
tapline — replay and inspect HTTP request logs

Usage:
  tapline [file] [options]

Options:
  -m, --method <METHOD>   Filter by HTTP method (GET, POST, ...)
  -s, --status <CODE>     Filter by HTTP status code
  -p, --path <pattern>    Filter by request path (substring match)
  -f, --format <type>     Output format: pretty (default), table, json
  -r, --replay            Replay filtered requests
  -d, --delay <ms>        Delay between replayed requests (default: 0)
  -h, --help              Show this help message
`);
}

module.exports = { parseArgs, printHelp, VALID_METHODS, VALID_FORMATS };
