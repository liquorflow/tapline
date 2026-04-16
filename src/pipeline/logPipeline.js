// logPipeline.js — build and run a pipeline of transform steps over log entries
const { parseLog } = require('../parser/logParser');
const { applyFilters } = require('../filter/logFilter');
const { transformEntries } = require('../transform/logTransformer');
const { sortEntries } = require('../sort/logSorter');
const { dedupeEntries } = require('../dedupe/logDeduper');
const { annotateEntries } = require('../annotate/logAnnotator');
const { splitEntries } = require('../split/logSplitter');

/**
 * Build a pipeline config from CLI-style options
 */
function buildPipeline(options = {}) {
  const steps = [];
  if (options.filter) steps.push({ type: 'filter', config: options.filter });
  if (options.transform) steps.push({ type: 'transform', config: options.transform });
  if (options.sort) steps.push({ type: 'sort', config: options.sort });
  if (options.dedupe) steps.push({ type: 'dedupe', config: options.dedupe });
  if (options.annotate) steps.push({ type: 'annotate' });
  if (options.split) steps.push({ type: 'split', config: options.split });
  return steps;
}

/**
 * Run a single step against entries
 */
function runStep(entries, step) {
  switch (step.type) {
    case 'filter': return applyFilters(entries, step.config);
    case 'transform': return transformEntries(entries, step.config);
    case 'sort': return sortEntries(entries, step.config);
    case 'dedupe': return dedupeEntries(entries, step.config);
    case 'annotate': return annotateEntries(entries);
    case 'split': return splitEntries(entries, step.config);
    default: throw new Error(`unknown pipeline step: ${step.type}`);
  }
}

/**
 * Run all pipeline steps against entries
 */
function runPipelineOnEntries(entries, steps) {
  return steps.reduce((acc, step) => {
    const result = runStep(acc, step);
    // If split returns an object/array-of-arrays, flatten back for further steps
    if (step.type === 'split' && !Array.isArray(result[0])) return Object.values(result).flat();
    if (step.type === 'split') return result.flat();
    return result;
  }, entries);
}

/**
 * Parse raw log text then run pipeline
 */
function runPipeline(rawLog, steps) {
  const entries = parseLog(rawLog);
  return runPipelineOnEntries(entries, steps);
}

module.exports = { buildPipeline, runStep, runPipeline, runPipelineOnEntries };
