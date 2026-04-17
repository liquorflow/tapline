# logRouter

Route log entries into named buckets based on ordered matching rules.

## Usage

```js
const { routeEntries, summarizeRoutes } = require('./logRouter');

const rules = [
  { field: 'status', match: '500',      bucket: 'errors'  },
  { field: 'path',   match: /^\/health/, bucket: 'health'  },
  { field: 'method', match: 'POST',     bucket: 'writes'  },
];

const buckets = routeEntries(entries, rules);
console.log(summarizeRoutes(buckets));
// { errors: 3, health: 1, writes: 12, default: 44 }
```

## API

### `routeEntries(entries, rules)`

Routes each entry into the first matching bucket. Unmatched entries land in `default`.

- `rules[].field` — entry property to inspect
- `rules[].match` — string (exact) or RegExp
- `rules[].bucket` — destination bucket name

Returns `Record<string, object[]>`.

### `summarizeRoutes(buckets)`

Returns a map of bucket name → entry count.

### `matchesRule(entry, rule)`

Low-level predicate. Returns `true` if the entry's field matches the rule.
