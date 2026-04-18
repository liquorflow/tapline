# Alert Module

Trigger and format alerts when log entries match defined conditions.

## Files

- `logAlerter.js` — core alerting logic
- `alertRules.js` — rule builders and defaults
- `alertFormatter.js` — CLI output formatting

## Usage

```js
const { checkAlerts, formatAlerts } = require('./logAlerter');
const { loadRules } = require('./alertRules');

const rules = loadRules([
  { name: 'slow-api', pathPrefix: '/api', minLatency: 500 }
]);

const triggered = checkAlerts(entries, rules);
console.log(formatAlerts(triggered));
```

## Rule Fields

| Field | Type | Description |
|---|---|---|
| name | string | Label for the alert |
| method | string | Match HTTP method |
| status | number | Exact status code match |
| statusGte | number | Status code >= value |
| minLatency | number | Duration >= value (ms) |
| maxLatency | number | Duration <= value (ms) |
| pathPrefix | string | Path starts with value |

## Default Rules

- `high-latency` — duration >= 1000ms
- `server-error` — status >= 500
- `not-found` — status === 404
