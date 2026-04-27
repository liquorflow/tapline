# forecast

Provides time-series forecasting for HTTP log entries, including linear regression, moving averages, and RMSE-based accuracy metrics.

## Modules

### `logForecaster.js`

Core forecasting logic.

| Function | Description |
|---|---|
| `buildTimeSeries(entries, interval)` | Buckets entries into time intervals and counts requests |
| `linearRegression(series)` | Fits a line to the series and returns slope/intercept |
| `movingAverage(series, window)` | Computes a rolling average over the series |
| `forecast(entries, opts)` | Runs the full forecast pipeline and returns a forecast object |
| `summarizeForecast(forecast)` | Returns a plain-text summary of forecast results |

### `forecastFormatter.js`

Formats forecast results for CLI output.

| Function | Description |
|---|---|
| `formatForecastTable(forecast)` | Renders a columnar table of actual vs predicted values |
| `formatForecastJson(forecast)` | Returns the forecast as a JSON string |
| `formatForecastSummary(forecast)` | Returns a compact one-block summary |
| `formatForecast(forecast, fmt)` | Dispatches to the appropriate formatter (`table`, `json`, `summary`) |

## Usage

```js
const { forecast } = require('./logForecaster');
const { formatForecast } = require('./forecastFormatter');

const result = forecast(entries, { method: 'linear', horizon: 5, interval: 60000 });
console.log(formatForecast(result, 'table'));
```

## Output example

```
Bucket          Actual          Predicted       Delta
----------------------------------------------------------------
10:00           100             98.50           1.50
10:01           110             105.00          5.00
10:02           N/A             112.30          N/A
```
