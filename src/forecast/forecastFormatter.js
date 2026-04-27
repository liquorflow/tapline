// forecastFormatter.js — formats forecast output for CLI display

const { colorizeStatus } = require('../formatter/outputFormatter');

function formatForecastTable(forecast) {
  if (!forecast || !forecast.points || forecast.points.length === 0) {
    return 'No forecast data available.';
  }
  const header = ['Bucket', 'Actual', 'Predicted', 'Delta'].map(h => h.padEnd(16)).join('');
  const divider = '-'.repeat(64);
  const rows = forecast.points.map(p => {
    const actual = p.actual != null ? String(p.actual) : 'N/A';
    const predicted = p.predicted != null ? p.predicted.toFixed(2) : 'N/A';
    const delta = p.actual != null && p.predicted != null
      ? (p.actual - p.predicted).toFixed(2)
      : 'N/A';
    return [
      String(p.bucket).padEnd(16),
      actual.padEnd(16),
      predicted.padEnd(16),
      delta.padEnd(16)
    ].join('');
  });
  return [header, divider, ...rows].join('\n');
}

function formatForecastJson(forecast) {
  return JSON.stringify(forecast, null, 2);
}

function formatForecastSummary(forecast) {
  if (!forecast) return 'No forecast available.';
  const { method, horizon, rmse, trend } = forecast;
  const lines = [
    `Method:  ${method || 'unknown'}`,
    `Horizon: ${horizon != null ? horizon : 'N/A'} buckets`,
    `RMSE:    ${rmse != null ? rmse.toFixed(4) : 'N/A'}`,
    `Trend:   ${trend || 'N/A'}`
  ];
  return lines.join('\n');
}

function formatForecast(forecast, fmt = 'table') {
  switch (fmt) {
    case 'json':    return formatForecastJson(forecast);
    case 'summary': return formatForecastSummary(forecast);
    case 'table':
    default:        return formatForecastTable(forecast);
  }
}

module.exports = { formatForecastTable, formatForecastJson, formatForecastSummary, formatForecast };
