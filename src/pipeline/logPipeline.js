const { parseLog } = require('../parser/logParser');
const { applyFilters } = require('../filter/logFilter');
const { transformEntries } = require('../transform/logTransformer');
const { formatEntries } = require('../formatter/outputFormatter');

/**
 * Build a pipeline config from CLI args
 */
function buildPipeline(args) {
  return {
    filters: {
      method: args.method || null,
      status: args.status || null,
      path: args.path || null,
    },
    transform: {
      redact: args.redact || [],
      normalize: args.normalize !== false,
      bucketLatency: args.bucketLatency || false,
    },
    format: args.format || 'pretty',
  };
}

/**
 * Run a full parse -> filter -> transform -> format pipeline
 * @param {string} rawLog - raw log text
 * @param {object} args - parsed CLI args
 * @returns {string} formatted output
 */
function runPipeline(rawLog, args) {
  const pipeline = buildPipeline(args);

  let entries = parseLog(rawLog);

  entries = applyFilters(entries, pipeline.filters);

  entries = transformEntries(entries, pipeline.transform);

  return formatEntries(entries, pipeline.format);
}

/**
 * Run pipeline on an array of already-parsed entries
 */
function runPipelineOnEntries(entries, args) {
  const pipeline = buildPipeline(args);

  let result = applyFilters(entries, pipeline.filters);
  result = transformEntries(result, pipeline.transform);

  return formatEntries(result, pipeline.format);
}

module.exports = { buildPipeline, runPipeline, runPipelineOnEntries };
