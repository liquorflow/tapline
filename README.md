# tapline

A lightweight CLI for managing and replaying HTTP request logs from local dev environments.

---

## Installation

```bash
npm install -g tapline
```

---

## Usage

Start capturing HTTP requests from your local server:

```bash
tapline record --port 3000
```

List saved request logs:

```bash
tapline logs
```

Replay a captured session:

```bash
tapline replay --file session-2024-01-15.log
```

Replay a specific request by ID:

```bash
tapline replay --id req_a3f9c2
```

### Options

| Flag | Description |
|------|-------------|
| `--port` | Port to intercept requests on |
| `--file` | Path to a `.log` file for replay |
| `--id` | Replay a single request by ID |
| `--verbose` | Show full request/response details |

---

## Example Workflow

```bash
# Record requests during a dev session
tapline record --port 3000

# Review what was captured
tapline logs

# Replay the full session against a staging server
tapline replay --file session-latest.log --target http://staging.example.com
```

---

## License

MIT © [tapline contributors](https://github.com/tapline/tapline)