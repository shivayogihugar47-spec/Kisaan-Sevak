import { CloudSun, Droplets, ScanSearch, Volume2, Wind } from "lucide-react";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import SectionLabel from "../components/SectionLabel";
import { useLanguage } from "../context/LanguageContext";
import useBelgaumWeather from "../hooks/useBelgaumWeather";
import { getWeatherAdvisory, getWeatherSummary } from "../i18n/translations";

export default function DailyBriefPage() {
  const { language, content } = useLanguage();
  const { weather, isLoading, error } = useBelgaumWeather();
  const weatherSummary = getWeatherSummary(language, weather.current.weatherCode);
  const advisory = getWeatherAdvisory(language, weather);
  const updatedAtLabel = weather.updatedAtValue
    ? weather.updatedAtValue.toLocaleString(content.locale, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : weather.updatedAt;
  const weatherStats = [
    { label: content.brief.weather, value: weather.current.temperature, icon: CloudSun },
    { label: content.brief.humidity, value: weather.current.humidity, icon: Droplets },
    { label: content.brief.wind, value: weather.current.wind, icon: Wind },
  ];
  const highlights = [
    advisory,
    `${content.brief.feelsLike} ${weather.current.apparentTemperature}. ${weather.daily.precipitationProbability}% ${content.brief.rainChance}`,
    content.brief.thirdHighlight,
  ];

  return (
    <main className="screen-shell">
      <Header
        title={content.brief.title}
        subtitle={content.brief.subtitle}
        location={content.locationLabel}
        showBack
      />

      {isLoading ? (
        <LoadingState label={content.brief.loading} />
      ) : (
        <Card>
          <p className="text-sm font-semibold text-leaf-600">{content.brief.morningAdvisory}</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-leaf-800">{weatherSummary}</h2>
          <p className="mt-3 text-sm text-leaf-700/80">{advisory}</p>
          <p className="mt-3 text-xs text-leaf-600">
            {content.common.updated} {updatedAtLabel}
            {error ? ` - ${content.brief.fallbackNotice}` : ""}
          </p>
          <Button className="mt-5 w-full">
            <Volume2 size={18} />
            {content.brief.playVoice}
          </Button>
        </Card>
      )}

      <section className="mt-6">
        <SectionLabel eyebrow={content.brief.fieldSnapshot} title={content.brief.weatherAndMoisture} />
        <div className="grid grid-cols-3 gap-3">
          {weatherStats.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-3 text-center">
              <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-leaf-100 bg-leaf-50 text-leaf-700">
                <Icon size={18} />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-leaf-500">
                {label}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-leaf-800">{value}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <SectionLabel eyebrow={content.brief.highlightsEyebrow} title={content.brief.attentionTitle} />
        <div className="space-y-3">
          {highlights.map((item) => (
            <Card key={item} className="flex items-start gap-3">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sun-100 bg-sun-100 text-leaf-800">
                <ScanSearch size={18} />
              </div>
              <p className="text-sm font-medium text-leaf-700">{item}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
