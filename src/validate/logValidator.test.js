const { validateEntry, validateEntries, isValidEntry } = require('./logValidator');

const validEntry = { method: 'GET', path: '/api/users', status: 200, duration: 45 };

describe('validateEntry', () => {
  test('returns no errors for a valid entry', () => {
    expect(validateEntry(validEntry)).toEqual([]);
  });

  test('returns error for missing method', () => {
    const errors = validateEntry({ ...validEntry, method: undefined });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/method/);
  });

  test('returns error for invalid method', () => {
    const errors = validateEntry({ ...validEntry, method: 'FETCH' });
    expect(errors[0]).toMatch(/method/);
  });

  test('returns error for missing path', () => {
    const errors = validateEntry({ ...validEntry, path: undefined });
    expect(errors[0]).toMatch(/path/);
  });

  test('returns error for path not starting with /', () => {
    const errors = validateEntry({ ...validEntry, path: 'api/users' });
    expect(errors[0]).toMatch(/path/);
  });

  test('returns error for missing status', () => {
    const errors = validateEntry({ ...validEntry, status: undefined });
    expect(errors[0]).toMatch(/status/);
  });

  test('returns error for out of range status', () => {
    const errors = validateEntry({ ...validEntry, status: 999 });
    expect(errors[0]).toMatch(/status/);
  });

  test('returns error for negative duration', () => {
    const errors = validateEntry({ ...validEntry, duration: -10 });
    expect(errors[0]).toMatch(/duration/);
  });

  test('allows missing duration', () => {
    const { duration, ...nodur } = validEntry;
    expect(validateEntry(nodur)).toEqual([]);
  });

  test('returns error for non-object input', () => {
    expect(validateEntry(null).length).toBeGreaterThan(0);
    expect(validateEntry('string').length).toBeGreaterThan(0);
  });
});

describe('validateEntries', () => {
  test('separates valid and invalid entries', () => {
    const entries = [
      validEntry,
      { method: 'INVALID', path: '/x', status: 200 },
      { method: 'POST', path: '/submit', status: 201, duration: 100 },
    ];
    const { valid, invalid } = validateEntries(entries);
    expect(valid.length).toBe(2);
    expect(invalid.length).toBe(1);
    expect(invalid[0].errors[0]).toMatch(/method/);
  });

  test('returns error when input is not array', () => {
    const result = validateEntries('not an array');
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('isValidEntry', () => {
  test('returns true for valid entry', () => {
    expect(isValidEntry(validEntry)).toBe(true);
  });

  test('returns false for invalid entry', () => {
    expect(isValidEntry({ method: 'GET' })).toBe(false);
  });
});
