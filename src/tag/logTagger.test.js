const { tagEntry, tagEntries, tagByCondition, tagByMethod, tagByStatusClass, tagSlow, removeTags } = require('./logTagger');

const entry = (overrides = {}) => ({ method: 'GET', path: '/api', status: 200, duration: 50, ...overrides });

describe('tagEntry', () => {
  it('adds tags to entry', () => {
    const r = tagEntry(entry(), { env: 'prod' });
    expect(r.tags.env).toBe('prod');
  });

  it('merges with existing tags', () => {
    const r = tagEntry(entry({ tags: { a: 1 } }), { b: 2 });
    expect(r.tags).toEqual({ a: 1, b: 2 });
  });
});

describe('tagEntries', () => {
  it('tags all entries', () => {
    const res = tagEntries([entry(), entry()], { x: true });
    expect(res.every(e => e.tags.x === true)).toBe(true);
  });
});

describe('tagByCondition', () => {
  it('only tags matching entries', () => {
    const entries = [entry({ status: 200 }), entry({ status: 500 })];
    const res = tagByCondition(entries, e => e.status >= 500, { error: true });
    expect(res[0].tags).toBeUndefined();
    expect(res[1].tags.error).toBe(true);
  });
});

describe('tagByMethod', () => {
  it('tags with lowercase method', () => {
    const res = tagByMethod([entry({ method: 'POST' })]);
    expect(res[0].tags.method).toBe('post');
  });
});

describe('tagByStatusClass', () => {
  it('tags 2xx correctly', () => expect(tagByStatusClass([entry({ status: 201 })])[0].tags.statusClass).toBe('2xx'));
  it('tags 4xx correctly', () => expect(tagByStatusClass([entry({ status: 404 })])[0].tags.statusClass).toBe('4xx'));
  it('tags 5xx correctly', () => expect(tagByStatusClass([entry({ status: 503 })])[0].tags.statusClass).toBe('5xx'));
});

describe('tagSlow', () => {
  it('tags entries above threshold', () => {
    const res = tagSlow([entry({ duration: 2000 }), entry({ duration: 100 })], 1000);
    expect(res[0].tags.slow).toBe(true);
    expect(res[1].tags).toBeUndefined();
  });
});

describe('removeTags', () => {
  it('removes specified tag keys', () => {
    const r = removeTags(entry({ tags: { a: 1, b: 2 } }), ['a']);
    expect(r.tags.a).toBeUndefined();
    expect(r.tags.b).toBe(2);
  });
});
