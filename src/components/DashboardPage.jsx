import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    MapPin, Droplets, CloudRain, Sun, Store, FileText,
    Users, Recycle, Volume2, ChevronRight, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getAgricultureNews } from "../services/newsService";
import useBelgaumWeather from "../hooks/useBelgaumWeather";
import { getWeatherSummary } from "../i18n/translations";
import PageWrapper from "../components/PageWrapper"; // Import the new wrapper

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function DashboardPage() {
    const { language, content } = useLanguage();
    const { profile } = useAuth();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);

    const { weather } = useBelgaumWeather();
    const weatherSummary = getWeatherSummary(language, weather?.current?.weatherCode) || weather?.summary;

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const articles = await getAgricultureNews("agriculture India", 1);
                if (articles && articles.length > 0) setNews(articles[0]);
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        };
        fetchNews();
    }, []);

    return (
        <PageWrapper>
            {/* --- TOP NAV --- */}
            <nav className="sticky top-0 z-40 flex items-center justify-between bg-leaf-50/90 px-5 py-4 backdrop-blur-md md:px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-700 text-white shadow-sm">
                        <Zap size={18} fill="currentColor" />
                    </div>
                    <span className="font-display text-xl font-extrabold tracking-tight text-leaf-900">Kisaan Sevak</span>
                </div>
                <LanguageSwitcher />
            </nav>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="mx-auto mt-4 max-w-5xl space-y-6 px-5 md:px-8"
            >
                {/* --- GREETING --- */}
                <motion.header variants={itemVariants}>
                    <h1 className="font-display text-3xl font-extrabold leading-tight text-leaf-900 md:text-4xl">
                        {content.dashboard.greeting}{profile?.name ? `, ${profile.name}` : ""}
                    </h1>
                    <div className="mt-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-leaf-600">
                        <MapPin size={14} /> Belgaum • {new Date().toLocaleDateString(content.locale, { weekday: 'long' })}
                    </div>
                </motion.header>

                {/* --- WEATHER HERO --- */}
                <motion.div variants={itemVariants} className="group relative h-[280px] overflow-hidden rounded-[32px] shadow-lg md:h-[320px]">
                    <img
                        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2064&auto=format&fit=crop"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        alt="Field"
                    />
                    <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-tr from-leaf-950/90 via-leaf-900/50 to-transparent p-6 md:p-8">
                        <div className="flex items-start justify-between">
                            <div className="rounded-2xl border border-white/20 bg-white/20 px-3 py-1.5 backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} className="text-sun-300" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{content.locationLabel}</span>
                                </div>
                            </div>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-leaf-600">
                                <Volume2 size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h2 className="font-display text-6xl font-black leading-none tracking-tighter text-white md:text-7xl">
                                    {weather?.current?.temperature?.replace('C', '') || "28°"}
                                </h2>
                                <p className="mt-2 flex items-center gap-2 text-base font-bold text-leaf-100 md:text-lg">
                                    <Sun size={20} className="text-sun-400" /> {weatherSummary || content.weather.codes.clear} • {weather?.daily?.maxTemperature || "32°C"} High
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md md:px-5">
                                    <Droplets size={18} className="text-sun-300" />
                                    <div>
                                        <p className="mb-0.5 text-[9px] font-black uppercase leading-none tracking-widest text-leaf-100/70 md:text-[10px]">{content.brief.humidity}</p>
                                        <p className="text-lg font-black text-white">{weather?.current?.humidity || "65%"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md md:px-5">
                                    <CloudRain size={18} className="text-sun-300" />
                                    <div>
                                        <p className="mb-0.5 text-[9px] font-black uppercase leading-none tracking-widest text-leaf-100/70 md:text-[10px]">{content.weather.codes.rain || "Rain"}</p>
                                        <p className="text-lg font-black text-white">{weather?.daily?.precipitationProbability ?? 10}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --- MODULE GRID --- */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        { title: content.dashboard.modules[1].title, subtitle: content.dashboard.modules[1].subtitle, icon: Store, route: "/mandi" },
                        { title: content.dashboard.modules[3].title, subtitle: content.dashboard.modules[3].subtitle, icon: FileText, route: "/schemes" },
                        { title: content.dashboard.modules[4].title, subtitle: content.dashboard.modules[4].subtitle, icon: Recycle, route: "/waste-to-wealth" },
                        { title: content.dashboard.modules[5].title, subtitle: content.dashboard.modules[5].subtitle, icon: Users, route: "/network" },
                    ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={i}
                                to={item.route}
                                className="group flex h-[160px] flex-col justify-between rounded-[28px] border border-leaf-100 bg-white p-5 shadow-sm transition-all hover:border-leaf-300 hover:shadow-md active:scale-95 md:h-[180px] md:p-6"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700 transition-colors group-hover:bg-leaf-600 group-hover:text-white">
                                    <Icon size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="font-display text-base font-bold leading-tight text-leaf-900 md:text-lg">
                                        {item.title}
                                    </h4>
                                    <div className="mt-1 flex items-center justify-between">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-leaf-500">
                                            {item.subtitle}
                                        </p>
                                        <ChevronRight size={14} className="text-leaf-300 transition-transform group-hover:translate-x-1 group-hover:text-leaf-600" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </motion.div>

                {/* --- LATEST UPDATES --- */}
                <motion.div variants={itemVariants} className="pt-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold text-leaf-900">Latest for Farm</h3>
                        <button className="rounded-full bg-leaf-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-leaf-700 transition-colors hover:bg-leaf-200">Explore all</button>
                    </div>

                    <a
                        href={news?.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 rounded-[24px] border border-leaf-100 bg-white p-4 shadow-sm transition-all hover:border-leaf-300 hover:shadow-md"
                    >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-leaf-50 md:h-24 md:w-24">
                            <img
                                src={news?.urlToImage || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2045&auto=format&fit=crop"}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                alt="news"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-leaf-500">{content.dashboard.newsLabel}</p>
                            <h4 className="font-display text-sm font-bold leading-snug text-leaf-900 transition-colors group-hover:text-leaf-600 md:text-base">
                                {loading ? content.common.loading : news?.title || "Agriculture Update"}
                            </h4>
                        </div>
                        <ChevronRight size={20} className="text-leaf-300 transition-transform group-hover:translate-x-1 group-hover:text-leaf-600 hidden sm:block" />
                    </a>
                </motion.div>
            </motion.div>
        </PageWrapper>
    );
}