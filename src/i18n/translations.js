import en from "./en";
import hi from "./hi";
import kn from "./kn";

// Export supportedLanguages for backward compatibility
export const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "kn", label: "ಕನ್ನಡ" },
];

const translations = { en, hi, kn };

export function getTranslation(language) {
  return translations[language] ?? translations.en;
}

export function getWeatherSummary(language, code) {
  const copy = getTranslation(language).weather.codes;

  if (code === 0) return copy.clear;
  if ([1, 2, 3].includes(code)) return copy.cloudy;
  if ([45, 48].includes(code)) return copy.fog;
  if ([51, 53, 55].includes(code)) return copy.drizzle;
  if ([56, 57].includes(code)) return copy.freezingDrizzle;
  if ([61, 63, 65].includes(code)) return copy.rain;
  if ([66, 67].includes(code)) return copy.freezingRain;
  if ([71, 73, 75, 77].includes(code)) return copy.snow;
  if ([80, 81, 82].includes(code)) return copy.showers;
  if ([85, 86].includes(code)) return copy.snowShowers;
  if ([95, 96, 99].includes(code)) return copy.thunderstorm;

  return copy.unknown;
}

export function getWeatherAdvisory(language, weather) {
  const copy = getTranslation(language).weather.advisories;
  const maxTemperature = Number.parseInt(weather.daily.maxTemperature, 10);

  if (weather.current.precipitation >= 1 || weather.daily.precipitationProbability >= 65) {
    return copy.rain;
  }

  if (maxTemperature >= 34) {
    return copy.heat;
  }

  if (weather.current.windSpeed >= 18) {
    return copy.wind;
  }

  return copy.steady;
}
