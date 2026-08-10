import { motion } from "framer-motion";
import {
  AlertCircle, Apple, ArrowDownRight, ArrowLeft, ArrowUpRight, Coffee,
  ChevronRight, Droplets, Flame, Leaf, MapPin, Phone, Search as SearchIcon,
  ShieldCheck, Sprout, Store, Sun, TrendingUp, Wheat, X, Zap
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../context/LanguageContext";
import { getMandiPricesWithHistory, getMarketInsights } from "../services/mandiService";
import { buildMandiAiRecommendation } from "../services/mandiAiService";
import { useAuth } from "../context/AuthContext";
import { getMandiAlertPreferences, saveMandiAlertPreference } from "../services/mandiAlertsService";
import { resolveUserLocation } from "../services/locationService";
import { requestJson } from "../lib/api";

// Crop catalog (same as before)
const CROP_CATALOG = [
  {
    category: "Grains & Cereals",
    items: [
      { name: "Paddy", icon: Wheat, color: "text-amber-600" },
      { name: "Wheat", icon: Wheat, color: "text-amber-600" },
      { name: "Maize", icon: Sun, color: "text-yellow-600" },
      { name: "Jowar", icon: Sprout, color: "text-orange-600" },
      { name: "Bajra", icon: Wheat, color: "text-amber-500" },
      { name: "Ragi", icon: Sprout, color: "text-stone-600" },
    ]
  },
  {
    category: "Pulses (Dal)",
    items: [
      { name: "Tur Dal", icon: Leaf, color: "text-yellow-600" },
      { name: "Moong", icon: Sprout, color: "text-emerald-600" },
      { name: "Chana", icon: Coffee, color: "text-orange-700" },
      { name: "Urad", icon: Leaf, color: "text-gray-600" },
    ]
  },
  {
    category: "Vegetables",
    items: [
      { name: "Onion", icon: Leaf, color: "text-purple-600" },
      { name: "Tomato", icon: Apple, color: "text-red-600" },
      { name: "Potato", icon: Sprout, color: "text-yellow-700" },
      { name: "Garlic", icon: Leaf, color: "text-slate-600" },
      { name: "Cabbage", icon: Leaf, color: "text-emerald-600" },
      { name: "Brinjal", icon: Sprout, color: "text-indigo-600" },
      { name: "Okra", icon: Leaf, color: "text-emerald-600" },
    ]
  },
  {
    category: "Fruits",
    items: [
      { name: "Banana", icon: Sun, color: "text-yellow-500" },
      { name: "Apple", icon: Apple, color: "text-red-500" },
      { name: "Mango", icon: Leaf, color: "text-orange-500" },
      { name: "Grapes", icon: Sprout, color: "text-purple-600" },
      { name: "Papaya", icon: Sun, color: "text-orange-400" },
      { name: "Pomegranate", icon: Apple, color: "text-rose-600" },
    ]
  },
  {
    category: "Commercial & Oil Seeds",
    items: [
      { name: "Cotton", icon: Droplets, color: "text-blue-600" },
      { name: "Sugarcane", icon: Sprout, color: "text-emerald-600" },
      { name: "Soyabean", icon: Leaf, color: "text-lime-600" },
      { name: "Groundnut", icon: Coffee, color: "text-stone-600" },
      { name: "Mustard", icon: Sun, color: "text-yellow-700" },
      { name: "Sunflower", icon: Sun, color: "text-amber-500" },
    ]
  },
  {
    category: "Spices",
    items: [
      { name: "Turmeric", icon: Flame, color: "text-yellow-600" },
      { name: "Red Chilli", icon: Flame, color: "text-red-600" },
      { name: "Coriander", icon: Leaf, color: "text-emerald-600" },
      { name: "Black Pepper", icon: Coffee, color: "text-gray-700" },
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
};

export default function MandiMitraPage() {
  const navigate = useNavigate();
  const { content } = useLanguage();
  const { profile } = useAuth();
  const [searchCrop, setSearchCrop] = useState("");
  const [mandiData, setMandiData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("detecting");
  const [locationContext, setLocationContext] = useState({ district: "", state: "" });
  const [insight, setInsight] = useState({
    insight: content?.mandiUi?.selectCropInsight ?? "Select a crop to see market insights",
    trend: "flat",
    percentage: 0,
  });

  const state = locationContext.state || profile?.meta?.state || "Karnataka";
  const district = locationContext.district || profile?.meta?.district || profile?.locationLabel || "Belgaum";
  const debounceTimer = useRef(null);

  useEffect(() => {
    async function loadLocation() {
      try {
        const result = await resolveUserLocation();
        setLocationContext({ district: result.district || "", state: result.state || "" });
        setLocationStatus("ready");
      } catch {
        setLocationStatus("fallback");
      }
    }

    loadLocation();
  }, []);

  useEffect(() => {
    async function loadAlerts() {
      const prefs = await getMandiAlertPreferences(profile?.id || "guest");
      const active = prefs.some((entry) => entry.enabled);
      setAlertsEnabled(active);
      if (prefs.length) {
        const crops = prefs.map((entry) => entry.crop).filter(Boolean);
        setWatchlist((prev) => Array.from(new Set([...prev, ...crops])));
      }
    }

    loadAlerts();
  }, [profile?.id]);

  useEffect(() => {
    if (searchCrop.trim() === "") {
      setHasSearched(false);
      setMandiData([]);
      setHistoricalData([]);
      setCurrentPrice(null);
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setHasSearched(true);
      fetchMandiData();
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [searchCrop]);

  const fetchMandiData = async () => {
    if (!searchCrop.trim()) return;
    setLoading(true);
    const result = await getMandiPricesWithHistory(searchCrop, state, district);
    if (result.success) {
      const modalPrices = result.data.map(p => Number(p.modalPrice)).filter(n => Number.isFinite(n));
      const avgPrice = modalPrices.length ? modalPrices.reduce((s, n) => s + n, 0) / modalPrices.length : 0;
      const transformedData = result.data.map(item => {
        const modalPrice = Number(item.modalPrice);
        const trendPercent = avgPrice ? ((modalPrice - avgPrice) / avgPrice) * 100 : 0;
        const rounded = Math.round(trendPercent * 10) / 10;
        const type = rounded >= 0 ? "up" : "down";
        const tagKey = rounded >= 0 ? "sellNow" : "wait";
        return {
          name: `${item.commodity}`,
          market: item.market || item.district || "Mandi",
          location: `${item.market || item.district} Mandi`,
          price: `₹${item.modalPrice}`,
          distance: item.distance || "Local market",
          trend: `${rounded >= 0 ? "+" : ""}${rounded.toFixed(1)}%`,
          type,
          tagKey,
          modalPrice,
          isLiveGovtData: item.isLiveGovtData
        };
      });
      setMandiData(transformedData);
      setHistoricalData(result.history || []);
      setCurrentPrice(Number(result.current?.modalPrice ?? 0));
      const derivedInsight = await getMarketInsights(result.data, result.history);
      setInsight(derivedInsight);
      setAiRecommendation(
        buildMandiAiRecommendation({
          crop: searchCrop,
          price: Number(result.current?.modalPrice ?? 0),
          trend: derivedInsight.trend,
          location: { district, state },
          profile,
          marketData: result.data,
        }),
      );

      try {
        const aiPayload = await requestJson("/api/mandi-ai", {
          method: "POST",
          body: JSON.stringify({
            crop: searchCrop,
            price: Number(result.current?.modalPrice ?? 0),
            trend: derivedInsight.trend,
            district,
            state,
            profileName: profile?.name || "farmer",
          }),
        });
        if (aiPayload?.data) {
          setAiRecommendation({
            headline: `${searchCrop} AI insight`,
            recommendation: aiPayload.data.recommendation,
            rationale: aiPayload.data.rationale,
            confidence: aiPayload.data.confidence,
            summary: aiPayload.data.summary,
            alertHint: aiPayload.data.alertHint,
          });
        }
      } catch {
        // keep fallback local recommendation
      }
    } else {
      setMandiData([]);
      setHistoricalData([]);
      setCurrentPrice(null);
      setAiRecommendation(null);
      setInsight({
        insight: formatCopy(content?.mandiUi?.noMandiDataInsight, { crop: searchCrop, district, state }) ||
          `No mandi data found for "${searchCrop}" in ${district}, ${state}.`,
        trend: "flat",
        percentage: 0,
      });
    }
    setLoading(false);
  };

  const handleClearSearch = () => setSearchCrop("");

  const toggleWatchlist = (crop) => {
    setWatchlist((prev) =>
      prev.includes(crop) ? prev.filter((item) => item !== crop) : [...prev, crop],
    );
  };

  const toggleAlerts = async () => {
    const nextValue = !alertsEnabled;
    setAlertsEnabled(nextValue);
    try {
      await saveMandiAlertPreference({
        userId: profile?.id || "guest",
        crop: searchCrop || "all",
        enabled: nextValue,
        threshold: currentPrice || 0,
        direction: nextValue ? "above" : "none",
        district,
        state,
      });
    } catch {
      // ignore
    }
  };

  return (
    <PageWrapper>
      <Header
        title={content?.mandi?.title ?? "Mandi Mitra"}
        subtitle={formatCopy(content?.mandiUi?.headerSubtitle, { district, state }) || `${district}, ${state}`}
        showBack
      />
      <div className="mx-auto max-w-6xl px-5 pb-16 md:px-8">

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-card md:rounded-[28px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 opacity-90" />
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-100/60 px-3 py-1.5 backdrop-blur-sm">
                  <Sprout size={14} className="text-emerald-700" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    {content?.mandiUi?.findTitle ?? "Find mandi prices"}
                  </span>
                </div>
                <h3 className="font-display text-xl font-extrabold text-[#032115] md:text-2xl">
                  Discover the best prices for your harvest
                </h3>
                <p className="mt-1.5 text-sm font-semibold text-slate-500 md:text-[15px]">
                  Real-time mandi rates • Verified government data • AI-powered insights
                </p>
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-200">
                  <Wheat size={28} className="text-white" />
                </div>
              </div>
            </div>
            <div className="relative mt-6">
              <div className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-200">
                <SearchIcon size={20} className="text-white" />
              </div>
              <input
                placeholder={content?.mandiUi?.searchPlaceholder ?? "Type or tap a crop below..."}
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 py-4 pl-[68px] pr-14 text-[15px] font-semibold text-[#032115] shadow-sm backdrop-blur-sm placeholder:text-slate-400 transition-all duration-200 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 md:py-[18px] md:text-base"
              />
              {searchCrop && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-100">
                <ShieldCheck size={13} className="text-emerald-600" /> Govt Verified
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-100">
                <Sun size={13} className="text-amber-500" /> Live Updates
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-100">
                <MapPin size={13} className="text-sky-600" /> {district}, {state}
              </span>
            </div>
          </div>
        </motion.div>

        {!hasSearched ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="mt-8 space-y-10">
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 shadow-card">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-200/50 to-teal-200/40 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-200/40 to-yellow-200/30 blur-2xl" />
              <div className="relative p-6 md:p-7">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200/60">
                      <Zap size={22} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-extrabold text-[#032115]">AI Market Copilot</h3>
                        <span className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                          Personalized
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-emerald-700/80">Smart farming decisions, powered by data</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-white/70 p-4 backdrop-blur-sm ring-1 ring-emerald-100/60">
                    <p className="text-[13px] font-bold leading-relaxed text-slate-700">
                      Your mandi view is now tailored to your farm profile, crop interests, live location, and AI guidance.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/70 p-4 backdrop-blur-sm ring-1 ring-emerald-100/60">
                    <p className="text-[13px] font-bold leading-relaxed text-slate-700">
                      <span className="font-extrabold text-emerald-700">{content?.mandiUi?.tipTitle ?? "Tip"}:</span>{" "}
                      {content?.mandiUi?.tipBody ??
                        "Tap any crop below to see verified mandi prices and trend insights."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {CROP_CATALOG.map((group, idx) => {
              const categoryStyles = {
                "Grains & Cereals": {
                  gradient: "from-amber-50 via-orange-50/40 to-yellow-50/30",
                  accent: "bg-gradient-to-br from-amber-500 to-orange-500",
                  label: "text-amber-700",
                  ring: "ring-amber-100",
                  hover: "group-hover:shadow-amber-200/50",
                },
                "Pulses (Dal)": {
                  gradient: "from-yellow-50 via-lime-50/40 to-amber-50/30",
                  accent: "bg-gradient-to-br from-yellow-500 to-amber-600",
                  label: "text-amber-700",
                  ring: "ring-yellow-100",
                  hover: "group-hover:shadow-yellow-200/50",
                },
                "Vegetables": {
                  gradient: "from-emerald-50 via-green-50/40 to-teal-50/30",
                  accent: "bg-gradient-to-br from-emerald-500 to-green-600",
                  label: "text-emerald-700",
                  ring: "ring-emerald-100",
                  hover: "group-hover:shadow-emerald-200/50",
                },
                "Fruits": {
                  gradient: "from-rose-50 via-orange-50/40 to-amber-50/30",
                  accent: "bg-gradient-to-br from-rose-500 to-orange-500",
                  label: "text-rose-700",
                  ring: "ring-rose-100",
                  hover: "group-hover:shadow-rose-200/50",
                },
                "Commercial & Oil Seeds": {
                  gradient: "from-sky-50 via-blue-50/40 to-indigo-50/30",
                  accent: "bg-gradient-to-br from-sky-500 to-indigo-500",
                  label: "text-sky-700",
                  ring: "ring-sky-100",
                  hover: "group-hover:shadow-sky-200/50",
                },
                "Spices": {
                  gradient: "from-red-50 via-orange-50/40 to-amber-50/30",
                  accent: "bg-gradient-to-br from-red-500 to-orange-600",
                  label: "text-red-700",
                  ring: "ring-red-100",
                  hover: "group-hover:shadow-red-200/50",
                },
              };
              const style = categoryStyles[group.category] || categoryStyles["Grains & Cereals"];
              return (
                <motion.div variants={itemVariants} key={idx} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${style.gradient} px-3.5 py-1.5 ring-1 ${style.ring}`}>
                      <span className={`text-[11px] font-black uppercase tracking-[0.18em] ${style.label}`}>
                        {content?.mandiUi?.categories?.[group.category] ?? group.category}
                      </span>
                    </div>
                    <div className={`h-px flex-1 bg-gradient-to-r ${style.gradient} opacity-60`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {group.items.length} crops
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {group.items.map((crop, cIdx) => {
                      const Icon = crop.icon;
                      return (
                        <button
                          key={cIdx}
                          onClick={() => setSearchCrop(crop.name)}
                          className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl ${style.hover} focus:outline-none focus:ring-4 focus:ring-emerald-100`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                          <div className="relative flex items-center gap-3">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.accent} shadow-md transition-transform duration-300 group-hover:scale-110`}>
                              <Icon size={20} className="text-white" strokeWidth={2.3} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-extrabold text-[#032115]">
                                {crop.name}
                              </span>
                              <span className="mt-0.5 block truncate text-[11px] font-bold text-slate-500 group-hover:text-slate-600">
                                View prices →
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="mt-8 space-y-6">
            {aiRecommendation ? (
              <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl shadow-card">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500" />
                <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl" />
                <div className="absolute right-12 top-12 h-20 w-20 rounded-full border border-white/10" />
                <div className="absolute right-20 top-20 h-10 w-10 rounded-full border border-white/10" />
                <div className="relative p-6 md:p-8 text-white">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                        <Zap size={22} className="text-white" fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/80">AI Market Copilot</p>
                        <h3 className="mt-1 font-display text-xl font-extrabold md:text-2xl">{aiRecommendation.headline}</h3>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm ring-1 ring-white/20">
                        <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Confidence</p>
                        <div className="mt-1.5 flex items-baseline gap-1">
                          <span className="font-display text-2xl font-black">{aiRecommendation.confidence}</span>
                          <span className="text-sm font-bold text-white/70">%</span>
                        </div>
                        <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-200"
                            style={{ width: `${aiRecommendation.confidence}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/10">
                      <p className="text-[11px] font-black uppercase tracking-wider text-white/60">Recommendation</p>
                      <p className="mt-1.5 text-sm font-bold leading-relaxed text-white">{aiRecommendation.recommendation}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/10">
                      <p className="text-[11px] font-black uppercase tracking-wider text-white/60">Why</p>
                      <p className="mt-1.5 text-sm font-bold leading-relaxed text-white/90">{aiRecommendation.rationale}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <button
                      onClick={toggleAlerts}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black transition-all duration-200 ${
                        alertsEnabled
                          ? "bg-white text-emerald-700 shadow-lg shadow-emerald-900/20"
                          : "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25 backdrop-blur-sm"
                      }`}
                    >
                      {alertsEnabled ? "✓ Alerts On" : "🔔 Enable price alerts"}
                    </button>
                    <button
                      onClick={() => toggleWatchlist(searchCrop)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black transition-all duration-200 ${
                        watchlist.includes(searchCrop)
                          ? "bg-white text-emerald-700 shadow-lg shadow-emerald-900/20"
                          : "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25 backdrop-blur-sm"
                      }`}
                    >
                      {watchlist.includes(searchCrop) ? "★ Watching" : "☆ Watch crop"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}

            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-500" />
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-100/60 blur-2xl" />
              <div className="relative p-6 pl-7 md:p-7 md:pl-8">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100">
                    <Sprout size={16} className="text-emerald-700" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {content?.mandiUi?.marketInsight ?? "Market insight"}
                  </p>
                </div>
                <p className="mt-4 font-display text-[17px] font-extrabold leading-relaxed text-[#032115] md:text-lg">
                  {insight.insight}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-slate-500">
                    {content?.mandiUi?.basedOnRecent ?? "Based on recent mandi data for"}{" "}
                    <span className="font-extrabold text-[#032115]">{searchCrop}</span>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card">
              <div className="bg-gradient-to-r from-slate-50 via-white to-amber-50/40 p-6 md:p-7 border-b border-slate-100">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100">
                        <TrendingUp size={16} className="text-amber-700" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {formatCopy(content?.mandiUi?.averageLabel, { district }) || `${district} average`}
                      </p>
                    </div>
                    <h3 className="mt-2 font-display text-xl font-extrabold text-[#032115] md:text-2xl">
                      {formatCopy(content?.mandiUi?.trendTitle, { crop: searchCrop }) || `${searchCrop} trend`}
                    </h3>
                  </div>
                  <div className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-black shadow-sm ${
                    insight.trend === "up" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60" :
                    insight.trend === "down" ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60" :
                    "bg-slate-100 text-slate-600 ring-1 ring-slate-200/60"
                  }`}>
                    {insight.trend === "up" && <ArrowUpRight size={16} strokeWidth={2.5} />}
                    {insight.trend === "down" && <ArrowDownRight size={16} strokeWidth={2.5} />}
                    {insight.percentage}%
                  </div>
                </div>
                <div className="mt-5 flex items-baseline gap-3">
                  <span className="font-display text-4xl font-black tracking-tight text-[#032115] md:text-5xl">₹{currentPrice || "—"}</span>
                  <div className="rounded-xl bg-slate-100 px-3 py-1.5">
                    <span className="text-xs font-black text-slate-600">per quintal</span>
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-7">
                {!loading && historicalData.length > 0 ? (
                  <div className="h-52 w-full md:h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} dy={8} fontWeight={600} />
                        <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} fontWeight={600} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#032115",
                            border: "none",
                            borderRadius: "14px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "white",
                            padding: "10px 14px",
                            boxShadow: "0 16px 40px rgba(3, 33, 21, 0.35)",
                          }}
                          labelStyle={{ color: "#86efac", fontWeight: 800, marginBottom: "4px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em" }}
                          formatter={(value) => [`₹${value}`, "Price"]}
                          cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 6, fill: "#10b981", stroke: "white", strokeWidth: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : loading ? (
                  <div className="flex h-52 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 md:h-60">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-3 border-emerald-200 border-t-emerald-500" />
                      <p className="text-sm font-bold text-slate-500">{content?.mandiUi?.loadingTrend ?? "Loading trend..."}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>

            <div className="flex flex-wrap items-center gap-2.5 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-card md:p-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-white shadow-sm shadow-emerald-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live data
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-amber-800 ring-1 ring-amber-200/60">
                <ShieldCheck size={13} className="text-amber-600" /> Govt-backed signals
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-50 to-indigo-50 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-sky-800 ring-1 ring-sky-200/60">
                <Zap size={13} className="text-sky-600" fill="currentColor" /> AI summary ready
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <MapPin size={13} className="text-slate-400" />
                {locationStatus === "ready" ? `Live location • ${district}, ${state}` : locationStatus === "fallback" ? `Default location • ${district}, ${state}` : `Detecting location…`}
              </span>
            </div>

            <div className="flex items-end justify-between pt-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-200" />
                  <h2 className="font-display text-xl font-extrabold text-[#032115] md:text-2xl">{content?.mandiUi?.livePricesTitle ?? "Live mandi prices"}</h2>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-500">{content?.mandiUi?.livePricesSubtitle ?? "Market • Price • Trend • Distance"}</p>
              </div>
              <span className="rounded-full bg-gradient-to-r from-slate-800 to-slate-900 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                {content?.mandiUi?.latest ?? "Latest"}
              </span>
            </div>

            <motion.div variants={containerVariants} className="space-y-4">
              {loading ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white py-16 text-center shadow-card">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                    <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-200 border-t-emerald-600" />
                  </div>
                  <p className="text-base font-bold text-slate-700">
                    {formatCopy(content?.mandiUi?.fetchingOfficial, { crop: searchCrop }) ||
                      `Fetching official prices for ${searchCrop}...`}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">This may take a few moments</p>
                </div>
              ) : mandiData.length > 0 ? (
                mandiData.map((item, i) => (
                  <motion.div variants={itemVariants} key={i} className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float">
                    <div className="p-5 md:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 ring-1 ring-slate-200/60">
                            <Store size={22} className="text-slate-600" />
                          </div>
                          <div>
                            <h3 className="font-display text-base font-extrabold text-[#032115] md:text-lg">{item.market}</h3>
                            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                              <MapPin size={13} className="text-slate-400" /> {item.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.isLiveGovtData ? (
                            <span className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1.5 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-200/60">
                              <ShieldCheck size={13} className="text-emerald-600" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 text-[11px] font-black text-amber-700 ring-1 ring-amber-200/60">
                              <AlertCircle size={13} className="text-amber-600" /> Estimate
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-3 ring-1 ring-slate-100">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Price</p>
                          <p className="mt-1 font-display text-lg font-extrabold text-[#032115]">{item.price}</p>
                          <p className="text-[10px] font-bold text-slate-500">per quintal</p>
                        </div>
                        <div className="rounded-2xl p-3 ring-1 ring-slate-100" style={{ backgroundColor: item.type === "up" ? "rgba(16, 185, 129, 0.06)" : "rgba(244, 63, 94, 0.06)" }}>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Trend</p>
                          <p className={`mt-1 inline-flex items-center gap-0.5 font-display text-lg font-extrabold ${item.type === "up" ? "text-emerald-600" : "text-rose-600"}`}>
                            {item.type === "up" ? <ArrowUpRight size={16} strokeWidth={2.5} /> : <ArrowDownRight size={16} strokeWidth={2.5} />}
                            {item.trend}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white p-3 ring-1 ring-sky-100/60">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Distance</p>
                          <p className="mt-1 font-display text-base font-extrabold text-slate-700">{item.distance}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <span className={`inline-flex items-center gap-1 rounded-2xl px-4 py-2.5 text-[11px] font-black uppercase tracking-wider ${
                            item.tagKey === "sellNow"
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200/60"
                              : "bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 ring-1 ring-slate-200"
                          }`}>
                            {item.tagKey === "sellNow" ? "🚜 SELL NOW" : "⏳ WAIT"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => window.open(`tel:+919876543210`)}
                          className="group/btn flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 transition group-hover/btn:bg-emerald-500">
                            <Phone size={14} className="text-slate-600 transition group-hover/btn:text-white" />
                          </div>
                          Contact agent
                        </button>
                        <button
                          onClick={() => toggleWatchlist(item.name || searchCrop)}
                          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-200 ${
                            watchlist.includes(item.name || searchCrop)
                              ? "bg-gradient-to-r from-[#032115] to-slate-800 text-white shadow-md shadow-slate-200"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800"
                          }`}
                        >
                          {watchlist.includes(item.name || searchCrop) ? "★ Watching" : "☆ Watch market"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-3xl border border-slate-200/80 bg-white py-20 text-center shadow-card">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 ring-1 ring-slate-200/60">
                    <SearchIcon size={36} className="text-slate-400" />
                  </div>
                  <p className="font-display text-xl font-extrabold text-[#032115]">{content?.mandiUi?.noDataTitle ?? "No data found"}</p>
                  <p className="mt-2 text-sm font-bold text-slate-500 max-w-sm mx-auto">
                    {formatCopy(content?.mandiUi?.noDataBody, { crop: searchCrop }) ||
                      `We couldn't find active trades for ${searchCrop} in your area today.`}
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-black text-white shadow-md shadow-emerald-200/60 transition hover:shadow-lg hover:shadow-emerald-300/60"
                  >
                    🌾 {content?.mandiUi?.browseOtherCrops ?? "Browse other crops"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}

// Helper components (unchanged)
function StatCell({ label, value, strong, right, tone, icon: Icon }) {
  return (
    <div className={`rounded-lg border border-gray-100 bg-gray-50/30 px-3 py-2 ${right ? "text-right" : ""}`}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <div className={`mt-1 flex items-center ${right ? "justify-end" : "justify-start"} gap-1`}>
        {Icon && <Icon size={14} className={tone || "text-gray-500"} />}
        <p className={`${strong ? "text-base font-semibold" : "text-sm font-medium"} ${tone || "text-gray-800"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function formatCopy(template, vars) {
  if (typeof template !== "string" || !template) return "";
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = vars?.[key];
    return value === undefined || value === null ? "" : String(value);
  });
}
