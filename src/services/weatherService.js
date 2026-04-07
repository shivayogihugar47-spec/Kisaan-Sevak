import { fetchWeatherApi } from "openmeteo";
import { dailyBrief, locationLabel } from "../data/mockData";

const BELGAUM_COORDS = {
  latitude: 15.8497,
  longitude: 74.4977,
};

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const CACHE_DURATION_MS = 10 * 60 * 1000;

let cachedWeather = null;
let cachedAt = 0;

const range = (start, stop, step) =>
  Array.from({ length: (stop - start) / step }, (_, index) => start + index * step);

function getWeatherDescription(code) {
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Mainly clear to overcast";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([56, 57].includes(code)) return "Freezing drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([66, 67].includes(code)) return "Freezing rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([85, 86].includes(code)) return "Snow showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";

  return "Weather update available";
}

function formatTemperature(value) {
  return `${Math.round(value)}\u00B0C`;
}

function formatHumidity(value) {
  return `${Math.round(value)}%`;
}

function formatWind(value) {
  return `${Math.round(value)} km/h`;
}

function buildAdvisory(current, daily) {
  if (current.precipitation >= 1 || daily.precipitationProbability >= 65) {
    return "Rain may interrupt field work today. Delay spraying and keep harvested produce covered.";
  }

  if (daily.maxTemperature >= 34) {
    return "Hot afternoon expected. Finish heavy field work early and plan light irrigation later.";
  }

  if (current.windSpeed >= 18) {
    return "Wind is stronger today. Avoid spray drift and secure loose covers before evening.";
  }

  return "Weather looks steady for routine field work. Spraying is safer in the late afternoon.";
}

function getFallbackWeather() {
  const fallbackTemperature = `28\u00B0C`;

  return {
    source: "mock",
    location: locationLabel,
    updatedAt: "Offline fallback",
    updatedAtValue: null,
    summary: dailyBrief.weather.condition,
    advisory: "Showing saved weather because live forecast is unavailable right now.",
    current: {
      temperature: fallbackTemperature,
      humidity: dailyBrief.weather.humidity,
      wind: dailyBrief.weather.wind,
      apparentTemperature: fallbackTemperature,
      weatherCode: null,
      isDay: true,
      precipitation: 0,
    },
    daily: {
      maxTemperature: fallbackTemperature,
      minTemperature: `22\u00B0C`,
      precipitationProbability: 20,
    },
  };
}

export async function fetchBelgaumWeather({ force = false, signal } = {}) {
  if (!force && cachedWeather && Date.now() - cachedAt < CACHE_DURATION_MS) {
    return cachedWeather;
  }

  const params = {
    latitude: BELGAUM_COORDS.latitude,
    longitude: BELGAUM_COORDS.longitude,
    timezone: "auto",
    forecast_days: 1,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day,precipitation",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
  };

  const responses = await fetchWeatherApi(FORECAST_URL, params, 3, 0.2, 2, {
    signal,
  });
  const response = responses[0];

  if (!response) {
    throw new Error("Weather response was incomplete.");
  }

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const current = response.current();
  const daily = response.daily();

  if (!current || !daily) {
    throw new Error("Weather response was incomplete.");
  }

  const dailyTimes = range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
    (time) => new Date((time + utcOffsetSeconds) * 1000),
  );

  const weather = {
    source: "open-meteo",
    location: locationLabel,
    updatedAtValue: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
    summary: getWeatherDescription(current.variables(3)?.value() ?? -1),
    current: {
      temperature: formatTemperature(current.variables(0)?.value() ?? 0),
      humidity: formatHumidity(current.variables(1)?.value() ?? 0),
      apparentTemperature: formatTemperature(current.variables(2)?.value() ?? 0),
      weatherCode: current.variables(3)?.value() ?? null,
      wind: formatWind(current.variables(4)?.value() ?? 0),
      windSpeed: current.variables(4)?.value() ?? 0,
      isDay: (current.variables(5)?.value() ?? 1) === 1,
      precipitation: current.variables(6)?.value() ?? 0,
    },
    daily: {
      date: dailyTimes[0],
      weatherCode: daily.variables(0)?.valuesArray()?.[0] ?? null,
      maxTemperature: formatTemperature(daily.variables(1)?.valuesArray()?.[0] ?? 0),
      minTemperature: formatTemperature(daily.variables(2)?.valuesArray()?.[0] ?? 0),
      precipitationProbability: Math.round(daily.variables(3)?.valuesArray()?.[0] ?? 0),
    },
  };

  weather.updatedAt = weather.updatedAtValue.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  weather.advisory = buildAdvisory(
    {
      precipitation: weather.current.precipitation,
      windSpeed: weather.current.windSpeed,
    },
    {
      maxTemperature: Number.parseInt(weather.daily.maxTemperature, 10),
      precipitationProbability: weather.daily.precipitationProbability,
    },
  );

  cachedWeather = weather;
  cachedAt = Date.now();

  return weather;
}

export function getFallbackBelgaumWeather() {
  return getFallbackWeather();
}
