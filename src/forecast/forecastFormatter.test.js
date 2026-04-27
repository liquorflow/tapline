const {
  formatForecastTable,
  formatForecastJson,
  formatForecastSummary,
  formatForecast
} = require('./forecastFormatter');

const sampleForecast = {
  method: 'linear',
  horizon: 3,
  rmse: 2.345,
  trend: 'increasing',
  points: [
    { bucket: '10:00', actual: 100, predicted: 98.5 },
    { bucket: '10:01', actual: 110, predicted: 105.0 },
    { bucket: '10:02', actual: null, predicted: 112.3 }
  ]
};

describe('formatForecastTable', () => {
  it('renders header and rows', () => {
    const out = formatForecastTable(sampleForecast);
    expect(out).toContain('Bucket');
    expect(out).toContain('Predicted');
    expect(out).toContain('10:00');
    expect(out).toContain('98.50');
  });

  it('shows N/A for missing actual', () => {
    const out = formatForecastTable(sampleForecast);
    expect(out).toContain('N/A');
  });

  it('returns fallback for empty forecast', () => {
    expect(formatForecastTable(null)).toBe('No forecast data available.');
    expect(formatForecastTable({ points: [] })).toBe('No forecast data available.');
  });
});

describe('formatForecastJson', () => {
  it('returns valid JSON string', () => {
    const out = formatForecastJson(sampleForecast);
    const parsed = JSON.parse(out);
    expect(parsed.method).toBe('linear');
    expect(parsed.points).toHaveLength(3);
  });
});

describe('formatForecastSummary', () => {
  it('includes method, horizon, rmse, trend', () => {
    const out = formatForecastSummary(sampleForecast);
    expect(out).toContain('linear');
    expect(out).toContain('3');
    expect(out).toContain('2.3450');
    expect(out).toContain('increasing');
  });

  it('handles null forecast gracefully', () => {
    expect(formatForecastSummary(null)).toBe('No forecast available.');
  });
});

describe('formatForecast', () => {
  it('dispatches to table by default', () => {
    const out = formatForecast(sampleForecast);
    expect(out).toContain('Bucket');
  });

  it('dispatches to json', () => {
    const out = formatForecast(sampleForecast, 'json');
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it('dispatches to summary', () => {
    const out = formatForecast(sampleForecast, 'summary');
    expect(out).toContain('Method');
  });
});
