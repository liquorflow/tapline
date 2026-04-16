// logSampler.js — sample entries from a log by rate, count, or interval

/**
 * Take every Nth entry
 * @param {object[]} entries
 * @param {number} n
 */
function sampleEveryN(entries, n) {
  if (n < 1) throw new Error('n must be >= 1');
  return entries.filter((_, i) => i % n === 0);
}

/**
 * Take a random sample of up to `count` entries
 * @param {object[]} entries
 * @param {number} count
 */
function sampleRandom(entries, count) {
  if (count >= entries.length) return [...entries];
  const shuffled = [...entries].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Take the first `count` entries
 */
function sampleHead(entries, count) {
  return entries.slice(0, count);
}

/**
 * Take the last `count` entries
 */
function sampleTail(entries, count) {
  return entries.slice(-count);
}

/**
 * Sample by rate (0.0 - 1.0), deterministically based on index
 */
function sampleByRate(entries, rate) {
  if (rate <= 0) return [];
  if (rate >= 1) return [...entries];
  return entries.filter((_, i) => (i / entries.length) < rate ||
    Math.floor(i * rate) > Math.floor((i - 1) * rate));
}

/**
 * Unified sampler
 * @param {object[]} entries
 * @param {{ mode: string, value: number }} opts
 */
function sampleEntries(entries, opts = {}) {
  const { mode = 'head', value = 10 } = opts;
  switch (mode) {
    case 'every': return sampleEveryN(entries, value);
    case 'random': return sampleRandom(entries, value);
    case 'head': return sampleHead(entries, value);
    case 'tail': return sampleTail(entries, value);
    case 'rate': return sampleByRate(entries, value);
    default: throw new Error(`Unknown sample mode: ${mode}`);
  }
}

module.exports = { sampleEveryN, sampleRandom, sampleHead, sampleTail, sampleByRate, sampleEntries };
