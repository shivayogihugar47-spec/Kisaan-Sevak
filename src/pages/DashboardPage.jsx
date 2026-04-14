import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CloudRain,
  Droplets,
  FileText,
  Navigation,
  Mic,
  LayoutGrid,
  TrendingUp,
  Tractor,
  Wind,
  Info,
  CalendarDays,
  Store,
  ShieldCheck,
  Sprout,
  Users,
  Waves,
} from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Header from "../components/Header";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getAgricultureNews } from "../services/newsService";
import { getWeatherSummary } from "../i18n/translations";
import useUserWeather from "../hooks/useUserWeather";

const COPY = {
  en: {
    appNameShort: "KisaanSevak",
    farmerFallback: "Farmer",
    belgaumFallback: "Belgaum",
    weatherUpdateFallback: "Weather update",
    statRain: "Rain",
    statRain1h: "Rain (1h)",
    statHumidity: "Humidity",
    statWind: "Wind",
    modulesTitle: "Modules",
    modulesSubtitle: "Open a tool to continue",
    modulesHint: "Tap a card",
    rentEquipment: "Rent equipment",
    mandiPrices: "Mandi Prices",
    liveCropSignals: "Live crop signals",
    govtSchemes: "Govt Schemes",
    benefitsNearby: "Benefits nearby",
    community: "Community",
    localFarmerNetwork: "Local farmer network",
    askKisaanAI: "Ask Kisaan AI",
    voiceAssistant: "Voice assistant",
    criticalUpdates: "Critical Updates",
    criticalUpdatesSubtitle: "Latest news + smart highlights",
    agriculturePulse: "Agriculture Pulse",
    today: "Today",
    unableLoadNews: "Unable to load news",
    fetchingLatestNews: "Fetching latest agriculture news...",
    tapToOpenUpdate: "Tap to open the latest update and get ahead for today’s work.",
    marketSignal: "Market signal",
    steadyToday: "Steady today",
    checkMandiHint: "Check Mandi for best dispatch",
    fieldAdvisory: "Field advisory",
    sprayWindow: "Spray window",
    lateAfternoonSafer: "Late afternoon looks safer",
    daily: "Daily",
    tasklist: "Tasklist",
    done: "done",
    progressLabel: "Progress",
    suggestedNext: "Suggested next",
    openMandiCompare: "Open {mandi} and compare 2 nearby markets.",
    goToMandi: "Go to Mandi",
    open: "Open",
    tasks: {
      market: "Check Market Price",
      leaf: "Upload Leaf Photo",
      water: "Watering Schedule",
    },
    greeting: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
      night: "Good night",
    },
    featured: {
      insuranceSub: "New Feature",
      insuranceTitle: "Weather Insurance",
      insuranceDesc: "Protect your crop for just ₹50. Secure claim process.",
      nutritionSub: "Scientific Farming",
      nutritionTitle: "Soil Health Calc",
      nutritionDesc: "Stop Urea waste with precision N-P-K based on your soil.",
      communityTitle: "Community Pulse",
      communityDesc: "50+ new discussions in your local area today.",
      learnMore: "Try now",
      sustainabilityTitle: "Sustainability Tip",
      sustainabilityDesc: "Convert crop residue to biochar to increase soil fertility by 15% this season.",
    },
  },
  hi: {
    appNameShort: "किसानसेवक",
    farmerFallback: "किसान",
    belgaumFallback: "बेलगाम",
    weatherUpdateFallback: "मौसम अपडेट",
    statRain: "बारिश",
    statRain1h: "बारिश (1h)",
    statHumidity: "नमी",
    statWind: "हवा",
    modulesTitle: "मॉड्यूल",
    modulesSubtitle: "आगे बढ़ने के लिए एक टूल खोलें",
    modulesHint: "कार्ड चुनें",
    rentEquipment: "उपकरण किराए पर",
    mandiPrices: "मंडी भाव",
    liveCropSignals: "लाइव कीमत संकेत",
    govtSchemes: "सरकारी योजनाएँ",
    benefitsNearby: "नज़दीकी लाभ",
    community: "समुदाय",
    localFarmerNetwork: "स्थानीय किसान नेटवर्क",
    askKisaanAI: "किसान एआई से पूछें",
    voiceAssistant: "वॉयस असिस्टेंट",
    criticalUpdates: "महत्वपूर्ण अपडेट",
    criticalUpdatesSubtitle: "ताज़ा खबर + स्मार्ट हाइलाइट्स",
    agriculturePulse: "कृषि पल्स",
    today: "आज",
    unableLoadNews: "समाचार लोड नहीं हो पाए",
    fetchingLatestNews: "ताज़ा कृषि समाचार लाए जा रहे हैं...",
    tapToOpenUpdate: "लेटेस्ट अपडेट खोलें और आज के काम के लिए तैयार रहें।",
    marketSignal: "बाज़ार संकेत",
    steadyToday: "आज स्थिर",
    checkMandiHint: "बेहतर डिस्पैच के लिए मंडी देखें",
    fieldAdvisory: "खेत सलाह",
    sprayWindow: "स्प्रे समय",
    lateAfternoonSafer: "दोपहर बाद अधिक सुरक्षित",
    daily: "दैनिक",
    tasklist: "कार्यसूची",
    done: "पूर्ण",
    progressLabel: "प्रगति",
    suggestedNext: "अगला सुझाव",
    openMandiCompare: "{mandi} खोलें और 2 नज़दीकी मंडियों की तुलना करें।",
    goToMandi: "मंडी जाएँ",
    open: "खोलें",
    tasks: {
      market: "मंडी भाव देखें",
      leaf: "पत्ती फोटो अपलोड करें",
      water: "सिंचाई शेड्यूल",
    },
    greeting: {
      morning: "सुप्रभात",
      afternoon: "नमस्कार",
      evening: "शुभ संध्या",
      night: "शुभ रात्रि",
    },
    featured: {
      insuranceSub: "नया फीचर",
      insuranceTitle: "मौसम बीमा",
      insuranceDesc: "सिर्फ ₹50 में अपनी फसल सुरक्षित करें। सुरक्षित दावा प्रक्रिया।",
      nutritionSub: "वैज्ञानिक खेती",
      nutritionTitle: "मिट्टी कैलकुलेटर",
      nutritionDesc: "यूरिया की बर्बादी रोकें, सटीक N-P-K जानें।",
      communityTitle: "समुदाय की हलचल",
      communityDesc: "आज आपके क्षेत्र में 50+ नई चर्चाएं।",
      learnMore: "अभी आज़माएं",
      sustainabilityTitle: "टिकाऊ खेती टिप्स",
      sustainabilityDesc: "मिट्टी की उर्वरता 15% बढ़ाने के लिए फसल अवशेषों को बायोचार में बदलें।",
    },
  },
  kn: {
    appNameShort: "ಕಿಸಾನ್‌ಸೇವಕ್",
    farmerFallback: "ರೈತ",
    belgaumFallback: "ಬೆಳಗಾವಿ",
    weatherUpdateFallback: "ಹವಾಮಾನ ಅಪ್ಡೇಟ್",
    statRain: "ಮಳೆ",
    statRain1h: "ಮಳೆ (1h)",
    statHumidity: "ತೇವಾಂಶ",
    statWind: "ಗಾಳಿ",
    modulesTitle: "ಮಾಡ್ಯೂಲ್‌ಗಳು",
    modulesSubtitle: "ಮುಂದುವರಿಸಲು ಒಂದು ಟೂಲ್ ತೆರೆಯಿರಿ",
    modulesHint: "ಕಾರ್ಡ್ ಟ್ಯಾಪ್ ಮಾಡಿ",
    rentEquipment: "ಉಪಕರಣ ಬಾಡಿಗೆ",
    mandiPrices: "ಮಂಡಿ ಬೆಲೆಗಳು",
    liveCropSignals: "ಲೈವ್ ಬೆಲೆ ಸೂಚನೆಗಳು",
    govtSchemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    benefitsNearby: "ಸಮೀಪದ ಲಾಭಗಳು",
    community: "ಸಮುದಾಯ",
    localFarmerNetwork: "ಸ್ಥಳೀಯ ರೈತ ಜಾಲ",
    askKisaanAI: "ಕಿಸಾನ್ ಎಐಗೆ ಕೇಳಿ",
    voiceAssistant: "ಧ್ವನಿ ಸಹಾಯಕ",
    criticalUpdates: "ಮುಖ್ಯ ಅಪ್ಡೇಟ್‌ಗಳು",
    criticalUpdatesSubtitle: "ಇತ್ತೀಚಿನ ಸುದ್ದಿ + ಸ್ಮಾರ್ಟ್ ಹೈಲೈಟ್ಸ್",
    agriculturePulse: "ಕೃಷಿ ಪಲ್ಸ್",
    today: "ಇಂದು",
    unableLoadNews: "ಸುದ್ದಿ ಲೋಡ್ ಆಗಲಿಲ್ಲ",
    fetchingLatestNews: "ಇತ್ತೀಚಿನ ಕೃಷಿ ಸುದ್ದಿಯನ್ನು ತರುತ್ತಿದ್ದೇವೆ...",
    tapToOpenUpdate: "ಇಂದಿನ ಕೆಲಸಕ್ಕೆ ಮುಂಚಿತವಾಗಿ ಇರಲು ಇತ್ತೀಚಿನ ಅಪ್ಡೇಟ್ ತೆರೆಯಿರಿ.",
    marketSignal: "ಮಾರುಕಟ್ಟೆ ಸೂಚನೆ",
    steadyToday: "ಇಂದು ಸ್ಥಿರ",
    checkMandiHint: "ಉತ್ತಮ ಡಿಸ್ಪ್ಯಾಚ್‌ಗಾಗಿ ಮಂಡಿ ನೋಡಿ",
    fieldAdvisory: "ಹೊಲ ಸಲಹೆ",
    sprayWindow: "ಸ್ಪ್ರೇ ಸಮಯ",
    lateAfternoonSafer: "ಸಂಜೆಯ ಹೊತ್ತಿಗೆ ಹೆಚ್ಚು ಸುರಕ್ಷಿತ",
    daily: "ದೈನಂದಿನ",
    tasklist: "ಕಾರ್ಯಪಟ್ಟಿ",
    done: "ಆಯಿತು",
    progressLabel: "ಪ್ರಗತಿ",
    suggestedNext: "ಮುಂದಿನ ಸಲಹೆ",
    openMandiCompare: "{mandi} ತೆರೆಯಿರಿ ಮತ್ತು 2 ಸಮೀಪದ ಮಂಡಿಗಳನ್ನು ಹೋಲಿಸಿ.",
    goToMandi: "ಮಂಡಿಗೆ ಹೋಗಿ",
    open: "ತೆರೆಯಿರಿ",
    tasks: {
      market: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ನೋಡಿ",
      leaf: "ಎಲೆ ಫೋಟೋ ಅಪ್ಲೋಡ್",
      water: "ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ",
    },
    greeting: {
      morning: "ಶುಭೋದಯ",
      afternoon: "ನಮಸ್ಕಾರ",
      evening: "ಶುಭ ಸಂಜೆ",
      night: "ಶುಭ ರಾತ್ರಿ",
    },
    featured: {
      insuranceSub: "ಹೊಸ ವೈಶಿಷ್ಟ್ಯ",
      insuranceTitle: "ಹವಾಮಾನ ವಿಮೆ",
      insuranceDesc: "ಕೇವಲ ₹50 ಕ್ಕೆ ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ರಕ್ಷಿಸಿ. ಸುಲಭ ಕ್ಲೈಮ್ ಪ್ರಕ್ರಿಯೆ.",
      nutritionSub: "ವೈಜ್ಞಾನಿಕ ಕೃಷಿ",
      nutritionTitle: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ",
      nutritionDesc: "ಯೂರಿಯಾ ವ್ಯರ್ಥ ಮಾಡುವುದನ್ನು ನಿಲ್ಲಿಸಿ. ನಿಖರ N-P-K ತಿಳಿಯಿರಿ.",
      communityTitle: "ಸಮುದಾಯದ ಪಲ್ಸ್",
      communityDesc: "ಇಂದು ನಿಮ್ಮ ಪರಿಸರದಲ್ಲಿ 50+ ಹೊಸ ಚರ್ಚೆಗಳು.",
      learnMore: "ಈಗ ಪ್ರಯತ್ನಿಸಿ",
      sustainabilityTitle: "ಸುಸ್ಥಿರತೆಯ ಸಲಹೆ",
      sustainabilityDesc: "ಮಣ್ಣಿನ ಫಲವತ್ತತೆಯನ್ನು 15% ಹೆಚ್ಚಿಸಲು ಬೆಳೆ ಅವಶೇಷಗಳನ್ನು ಬಯೋಚಾರ್ ಆಗಿ ಪರಿವರ್ತಿಸಿ.",
    },
  },
};

function getTimeSlot(date) {
  const hour = date.getHours();
  return hour < 5 ? "night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";
}

function formatCopy(template, vars) {
  if (typeof template !== "string" || !template) return "";
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = vars?.[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export default function Dashboard() {
  const { language, content } = useLanguage();
  const t = COPY[language] || COPY.en;
  const { profile } = useAuth();
  const [news, setNews] = useState(null);
  const [newsError, setNewsError] = useState("");
  
  const { weather, usingFallback } = useUserWeather();
  const temperature = String(weather?.current?.temperature || "28°").replace("C", "");
  const weatherSummary =
    getWeatherSummary(language, weather?.current?.weatherCode) || weather?.summary || t.weatherUpdateFallback;
  const rainChance = weather?.daily?.precipitationProbability ?? null;
  const humidity = weather?.current?.humidity || "65%";
  const wind = weather?.current?.wind || "9 km/h";

  useEffect(() => {
    let cancelled = false;
    setNewsError("");
    getAgricultureNews("agriculture India", 1)
      .then((articles) => {
        if (!cancelled && articles?.[0]) setNews(articles[0]);
      })
      .catch((e) => {
        if (!cancelled) setNewsError(e?.message || t.unableLoadNews);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F7F5] text-[#1A2E26] font-sans antialiased">
      <Header 
        title={content?.dashboard?.title ?? t.appNameShort} 
        subtitle={t.today}
        maxWidth="max-w-5xl"
      />

      <main className="max-w-5xl mx-auto p-4 space-y-4 pb-24 md:px-8">
        
        {/* Compact Weather & Greeting Card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-900/20">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                <Navigation size={12} fill="currentColor" />{" "}
                {weather?.location || profile?.locationLabel || content?.locationLabel || t.belgaumFallback}
              </p>
              <h2 className="text-3xl font-bold tracking-tight">
                {t.greeting[getTimeSlot(new Date())]},{" "}
                <span className="text-emerald-300">{profile?.name || t.farmerFallback}</span>
              </h2>
            </div>
            <div className="text-right">
              <span className="text-5xl font-black tracking-tighter">{temperature}</span>
              <p className="text-xs font-medium text-emerald-200/90">{weatherSummary}</p>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-2">
            <QuickStat
              label={typeof rainChance === "number" ? t.statRain : t.statRain1h}
              value={
                typeof rainChance === "number"
                  ? `${rainChance}%`
                  : `${Number(weather?.current?.rain1hMm ?? 0).toFixed(1)} mm`
              }
              icon={CloudRain}
            />
            <QuickStat label={t.statHumidity} value={humidity} icon={Droplets} />
            <QuickStat label={t.statWind} value={wind} icon={Wind} />
          </div>

          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
        </section>

        {/* Modules grid */}
        <section className="rounded-[2rem] border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex items-end justify-between gap-4 px-1 pb-3">
            <div>
              <p className="text-sm font-black text-slate-900">{t.modulesTitle}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{t.modulesSubtitle}</p>
            </div>
            <p className="hidden text-xs font-semibold text-slate-500 sm:block">{t.modulesHint}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ModuleCard
              to="/rentals"
              title={content?.sidebar?.krishiKiraya ?? t.modulesTitle}
              subtitle={t.rentEquipment}
              icon={Tractor}
              color="from-purple-500 to-fuchsia-500"
              openLabel={t.open}
            />
            <ModuleCard to="/mandi" title={t.mandiPrices} subtitle={t.liveCropSignals} icon={Store} color="from-orange-500 to-amber-500" openLabel={t.open} />
            <ModuleCard to="/schemes" title={t.govtSchemes} subtitle={t.benefitsNearby} icon={BadgeCheck} color="from-blue-600 to-sky-500" openLabel={t.open} />
            <ModuleCard to="/network" title={t.community} subtitle={t.localFarmerNetwork} icon={Users} color="from-slate-800 to-slate-600" openLabel={t.open} />
            <ModuleCard to="/chat" title={t.askKisaanAI} subtitle={t.voiceAssistant} icon={Mic} color="from-emerald-700 to-emerald-500" openLabel={t.open} />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <SectionHeader title={t.criticalUpdates} subtitle={t.criticalUpdatesSubtitle} />
            <article className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
              <a
                href={news?.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 group"
              >
                <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden bg-slate-100">
                  {news?.urlToImage ? (
                    <img
                      src={news.urlToImage}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt="news"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-slate-50" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                      {t.agriculturePulse}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest">
                      <CalendarDays size={12} /> {t.today}
                    </span>
                  </div>

                  <h4 className="mt-2 font-black text-slate-900 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {news?.title || (newsError ? t.unableLoadNews : t.fetchingLatestNews)}
                  </h4>

                  <p className="mt-2 text-xs font-semibold text-slate-500 line-clamp-2">
                    {news?.description || (newsError ? newsError : t.tapToOpenUpdate)}
                  </p>
                </div>

                <div className="shrink-0 flex items-center">
                  <div className="h-10 w-10 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </a>
            </article>

            <div className="grid gap-4 sm:grid-cols-2">
              <PromotionalCard
                to="/insurance"
                sub={t.featured.insuranceSub}
                title={t.featured.insuranceTitle}
                desc={t.featured.insuranceDesc}
                icon={ShieldCheck}
                color="bg-indigo-600"
                button={t.featured.learnMore}
              />
              <PromotionalCard
                to="/nutrition"
                sub={t.featured.nutritionSub}
                title={t.featured.nutritionTitle}
                desc={t.featured.nutritionDesc}
                icon={Droplets}
                color="bg-emerald-600"
                button={t.featured.learnMore}
              />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sun-400 to-sun-600 p-6 text-white shadow-lg">
              <div className="relative z-10">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <Sprout size={20} className="text-white" />
                </div>
                <h3 className="font-display text-lg font-black">{t.featured.sustainabilityTitle}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-sun-50">
                  {t.featured.sustainabilityDesc}
                </p>
              </div>
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            </div>

            <Link
              to="/network"
              className="group block overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                  <Users size={20} />
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="user" />
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="font-display text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                {t.featured.communityTitle}
              </h3>
              <p className="mt-2 text-xs font-semibold text-slate-500 leading-relaxed">
                {t.featured.communityDesc}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-black text-emerald-700">
                {t.featured.learnMore} <ArrowRight size={16} />
              </div>
            </Link>
          </aside>
        </div>
      </main>

      {/* Floating Bottom Nav for Mobile-First usage
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-3 md:hidden flex justify-between items-center z-50">
        <NavIcon icon={LayoutGrid} active />
        <NavIcon icon={Store} />
        <div className="bg-emerald-600 p-3 rounded-full -mt-12 shadow-lg border-4 border-[#F4F7F5] text-white">
          <Mic size={24} />
        </div>
        <NavIcon icon={TrendingUp} />
        <NavIcon icon={Navigation} />
      </footer> */}
    </div>
  );
}

function PromotionalCard({ to, sub, title, desc, icon: Icon, color, button }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-sm transition hover:shadow-md active:scale-[0.99] md:p-8"
    >
      <div className="relative z-10">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${color} text-white shadow-lg shadow-black/5`}>
          <Icon size={24} />
        </div>
        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-600 transition-colors">
          {sub}
        </p>
        <h3 className="font-display text-xl font-black text-slate-900 md:text-2xl">{title}</h3>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500 md:text-sm">
          {desc}
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm font-black text-emerald-700">
          {button} <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </div>
      </div>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-slate-50 transition group-hover:bg-emerald-50" />
    </Link>
  );
}

function ModuleCard({ to, title, subtitle, icon: Icon, color, openLabel }) {
  return (
    <Link
      to={to}
      className="group rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:shadow-md active:scale-[0.99]"
    >
      <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-sm ring-1 ring-black/5`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <p className="mt-3 text-sm font-black text-slate-900">{title}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-black text-emerald-700">{openLabel}</span>
        <ArrowRight size={16} className="text-slate-300 transition group-hover:text-emerald-700" />
      </div>
    </Link>
  );
}

function QuickStat({ label, value, icon: Icon }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
      <Icon size={16} className="mx-auto mb-1 text-emerald-300" />
      <p className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">{label}</p>
      <p className="font-bold text-sm">{value}</p>
    </div>
  );
}

function NavIcon({ icon: Icon, active }) {
  return (
    <button className={`p-2 ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    </button>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="px-1">
      <p className="text-sm font-black text-slate-900">{title}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>
    </div>
  );
}