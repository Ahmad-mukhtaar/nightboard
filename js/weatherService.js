const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const WEATHER_CODE_LABELS = {
  0: 'CLEAR',
  1: 'MAINLY CLEAR',
  2: 'PARTLY CLOUDY',
  3: 'CLOUDY',
  45: 'FOG',
  48: 'RIME FOG',
  51: 'LIGHT DRIZZLE',
  53: 'DRIZZLE',
  55: 'HEAVY DRIZZLE',
  61: 'LIGHT RAIN',
  63: 'RAIN',
  65: 'HEAVY RAIN',
  71: 'LIGHT SNOW',
  73: 'SNOW',
  75: 'HEAVY SNOW',
  80: 'RAIN SHOWERS',
  81: 'SHOWERS',
  82: 'HEAVY SHOWERS',
  95: 'THUNDER',
  96: 'THUNDER HAIL',
  99: 'SEVERE THUNDER'
};

export function weatherCodeToLabel(code) {
  return WEATHER_CODE_LABELS[code] || 'WEATHER';
}

export class WeatherService {
  async fetchCityWeather(cityQuery) {
    const location = await this._searchCity(cityQuery);
    const weather = await this._fetchCurrentWeather(location.latitude, location.longitude);

    return {
      city: [location.name, location.country_code].filter(Boolean).join(', '),
      timezone: weather.timezone || location.timezone,
      temperature: `${Math.round(weather.temperature_2m)}C`,
      condition: weatherCodeToLabel(weather.weather_code)
    };
  }

  async _searchCity(cityQuery) {
    const params = new URLSearchParams({
      name: cityQuery,
      count: '1',
      language: 'en',
      format: 'json'
    });
    const response = await fetch(`${GEOCODING_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('City lookup failed');
    }

    const payload = await response.json();
    const location = payload.results?.[0];
    if (!location) {
      throw new Error('City not found');
    }

    return location;
  }

  async _fetchCurrentWeather(latitude, longitude) {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: 'temperature_2m,weather_code',
      timezone: 'auto',
      forecast_days: '1'
    });
    const response = await fetch(`${FORECAST_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Weather lookup failed');
    }

    const payload = await response.json();
    if (!payload.current) {
      throw new Error('Weather unavailable');
    }

    return {
      ...payload.current,
      timezone: payload.timezone
    };
  }
}
