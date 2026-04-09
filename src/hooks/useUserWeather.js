import { useEffect, useMemo, useState } from "react";
import useBelgaumWeather from "./useBelgaumWeather";

function formatTempC(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return `${Math.round(value)}°`;
}

function formatHumidity(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return `${Math.round(value)}%`;
}

function formatWindKmh(valueKmh) {
  if (typeof valueKmh !== "number" || Number.isNaN(valueKmh)) return "";
  return `${Math.round(valueKmh)} km/h`;
}

export default function useUserWeather() {
  const apiKey = import.meta.env.VITE_WEATHERAPI_KEY;
  const fallback = useBelgaumWeather();

  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator?.geolocation) {
      setCoords(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setCoords(null);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        if (!apiKey) {
          throw new Error("Missing WeatherAPI key.");
        }
        if (!coords?.lat || !coords?.lon) {
          throw new Error("Location permission not granted.");
        }

        // WeatherAPI realtime weather: https://www.weatherapi.com/docs/
        const url = new URL("https://api.weatherapi.com/v1/current.json");
        url.searchParams.set("key", apiKey);
        url.searchParams.set("q", `${coords.lat},${coords.lon}`);
        url.searchParams.set("aqi", "no");

        const res = await fetch(url.toString());
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Weather request failed (${res.status}).`);
        }
        const json = await res.json();

        if (cancelled) return;

        const next = {
          source: "weatherapi",
          location: json?.location?.name || "Your location",
          updatedAt: json?.location?.localtime || "Just now",
          summary: json?.current?.condition?.text || "Weather update",
          current: {
            temperature: formatTempC(json?.current?.temp_c),
            humidity: formatHumidity(json?.current?.humidity),
            wind: formatWindKmh(json?.current?.wind_kph),
            rain1hMm: typeof json?.current?.precip_mm === "number" ? json.current.precip_mm : 0,
          },
        };

        setWeather(next);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Unable to load weather.");
        setWeather(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [apiKey, coords?.lat, coords?.lon]);

  const merged = useMemo(() => {
    if (weather) return weather;
    // fallback already returns shape compatible with DashboardPage usage
    return fallback.weather;
  }, [fallback.weather, weather]);

  return {
    weather: merged,
    isLoading: isLoading && fallback.isLoading,
    error: error || fallback.error,
    usingFallback: !weather,
  };
}

