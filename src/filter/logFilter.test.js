const { filterByMethod, filterByStatus, filterByPath, applyFilters } = require('./logFilter');

const sampleEntries = [
  { method: 'GET',    path: '/api/users',        status: 200 },
  { method: 'POST',   path: '/api/users',        status: 201 },
  { method: 'GET',    path: '/api/products',     status: 200 },
  { method: 'DELETE', path: '/api/users/42',     status: 404 },
  { method: 'PUT',    path: '/api/users/42',     status: 500 },
  { method: 'GET',    path: '/health',           status: 200 },
];

describe('filterByMethod', () => {
  test('returns only GET entries', () => {
    const result = filterByMethod(sampleEntries, 'GET');
    expect(result).toHaveLength(3);
    result.forEach((e) => expect(e.method).toBe('GET'));
  });

  test('is case-insensitive', () => {
    const result = filterByMethod(sampleEntries, 'post');
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/api/users');
  });

  test('returns all entries when method is empty string', () => {
    expect(filterByMethod(sampleEntries, '')).toHaveLength(sampleEntries.length);
  });
});

describe('filterByStatus', () => {
  test('filters by exact status code', () => {
    const result = filterByStatus(sampleEntries, 200);
    expect(result).toHaveLength(3);
  });

  test('filters by status range prefix (4xx)', () => {
    const result = filterByStatus(sampleEntries, '4');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(404);
  });

  test('filters by status range prefix (5xx)', () => {
    const result = filterByStatus(sampleEntries, '5');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(500);
  });

  test('returns all entries when status is null', () => {
    expect(filterByStatus(sampleEntries, null)).toHaveLength(sampleEntries.length);
  });
});

describe('filterByPath', () => {
  test('filters entries containing /api/users', () => {
    const result = filterByPath(sampleEntries, '/api/users');
    expect(result).toHaveLength(3);
  });

  test('filters entries containing /health', () => {
    const result = filterByPath(sampleEntries, '/health');
    expect(result).toHaveLength(1);
  });

  test('returns all entries when pathPattern is empty', () => {
    expect(filterByPath(sampleEntries, '')).toHaveLength(sampleEntries.length);
  });
});

describe('applyFilters', () => {
  test('combines method and status filters', () => {
    const result = applyFilters(sampleEntries, { method: 'GET', status: 200 });
    expect(result).toHaveLength(3);
  });

  test('combines method and path filters', () => {
    const result = applyFilters(sampleEntries, { method: 'GET', path: '/api' });
    expect(result).toHaveLength(2);
  });

  test('returns all entries with empty options', () => {
    expect(applyFilters(sampleEntries, {})).toHaveLength(sampleEntries.length);
  });
});
