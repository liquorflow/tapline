// Validates parsed log entries for required fields and types

const VALID_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

function validateEntry(entry) {
  const errors = [];

  if (!entry || typeof entry !== 'object') {
    return ['Entry must be a non-null object'];
  }

  if (!entry.method || !VALID_METHODS.includes(entry.method.toUpperCase())) {
    errors.push(`Invalid or missing method: ${entry.method}`);
  }

  if (!entry.path || typeof entry.path !== 'string' || !entry.path.startsWith('/')) {
    errors.push(`Invalid or missing path: ${entry.path}`);
  }

  if (entry.status === undefined || entry.status === null) {
    errors.push('Missing status code');
  } else {
    const status = Number(entry.status);
    if (!Number.isInteger(status) || status < 100 || status > 599) {
      errors.push(`Invalid status code: ${entry.status}`);
    }
  }

  if (entry.duration !== undefined && entry.duration !== null) {
    const dur = Number(entry.duration);
    if (isNaN(dur) || dur < 0) {
      errors.push(`Invalid duration: ${entry.duration}`);
    }
  }

  return errors;
}

function validateEntries(entries) {
  if (!Array.isArray(entries)) {
    return { valid: [], invalid: [], errors: ['Input must be an array'] };
  }

  const valid = [];
  const invalid = [];

  for (const entry of entries) {
    const errors = validateEntry(entry);
    if (errors.length === 0) {
      valid.push(entry);
    } else {
      invalid.push({ entry, errors });
    }
  }

  return { valid, invalid };
}

function isValidEntry(entry) {
  return validateEntry(entry).length === 0;
}

module.exports = { validateEntry, validateEntries, isValidEntry };
