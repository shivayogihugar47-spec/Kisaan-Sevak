import { useEffect, useState } from "react";
import { fetchBelgaumWeather, getFallbackBelgaumWeather } from "../services/weatherService";

export default function useBelgaumWeather() {
  const [weather, setWeather] = useState(getFallbackBelgaumWeather());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function loadWeather() {
      try {
        setIsLoading(true);
        const nextWeather = await fetchBelgaumWeather({ signal: controller.signal });

        if (!isMounted) {
          return;
        }

        setWeather(nextWeather);
        setError("");
      } catch (loadError) {
        if (!isMounted || loadError.name === "AbortError") {
          return;
        }

        setWeather(getFallbackBelgaumWeather());
        setError("Live weather is unavailable right now.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadWeather();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return { weather, isLoading, error };
}
