# Pipeline

The `logPipeline` module chains the core tapline stages into a single callable flow:

```
parse → filter → transform → format
```

## Usage

```js
const { runPipeline } = require('./logPipeline');

const output = runPipeline(rawLogText, {
  method: 'GET',
  status: 200,
  format: 'table',
  redact: ['authorization'],
});

console.log(output);
```

## API

### `buildPipeline(args)`
Converts parsed CLI args into a structured pipeline config object.

### `runPipeline(rawLog, args)`
Accepts raw log text and CLI args. Parses, filters, transforms, and formats in one call.

### `runPipelineOnEntries(entries, args)`
Same as `runPipeline` but skips the parse step — useful when entries are already in memory (e.g. loaded from a session).

## Formats

| Flag | Output |
|------|--------|
| `pretty` | colorized human-readable |
| `table` | aligned columns |
| `json` | JSON array |
