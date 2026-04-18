// logSnapshot.js — capture and compare point-in-time snapshots of log entry sets

const crypto = require('crypto');

function hashEntry(entry) {
  const key = `${entry.method}:${entry.path}:${entry.status}:${entry.latency}`;
  return crypto.createHash('md5').update(key).digest('hex');
}

function takeSnapshot(entries, label = '') {
  return {
    label,
    timestamp: new Date().toISOString(),
    count: entries.length,
    hashes: entries.map(hashEntry),
    entries: entries.map(e => ({ ...e })),
  };
}

function compareSnapshots(snapA, snapB) {
  const setA = new Set(snapA.hashes);
  const setB = new Set(snapB.hashes);

  const added = snapB.hashes.filter(h => !setA.has(h));
  const removed = snapA.hashes.filter(h => !setB.has(h));
  const retained = snapA.hashes.filter(h => setB.has(h));

  return {
    added: added.length,
    removed: removed.length,
    retained: retained.length,
    addedEntries: snapB.entries.filter((_, i) => added.includes(snapB.hashes[i])),
    removedEntries: snapA.entries.filter((_, i) => removed.includes(snapA.hashes[i])),
  };
}

function snapshotSummary(snapshot) {
  return `[${snapshot.label || 'snapshot'}] ${snapshot.timestamp} — ${snapshot.count} entries`;
}

module.exports = { hashEntry, takeSnapshot, compareSnapshots, snapshotSummary };
