import { motion } from "framer-motion";
import {
  AlertCircle, Apple, ArrowDownRight, ArrowLeft, ArrowUpRight, Coffee,
  ChevronRight, Droplets, Flame, Leaf, MapPin, Phone, Search as SearchIcon,
  ShieldCheck, Sprout, Sun, Wheat, X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../context/LanguageContext";
import { getMandiPricesWithHistory, getMarketInsights } from "../services/mandiService";

// Comprehensive, farmer-friendly categorized crop list
const CROP_CATALOG = [
  {
    category: "Grains & Cereals",
    items: [
      { name: "Paddy", icon: Wheat, color: "bg-amber-100 text-amber-700" },
      { name: "Wheat", icon: Wheat, color: "bg-amber-100 text-amber-700" },
      { name: "Maize", icon: Sun, color: "bg-yellow-100 text-yellow-700" },
      { name: "Jowar", icon: Sprout, color: "bg-orange-100 text-orange-700" },
      { name: "Bajra", icon: Wheat, color: "bg-amber-50 text-amber-600" },
      { name: "Ragi", icon: Sprout, color: "bg-stone-200 text-stone-800" },
    ]
  },
  {
    category: "Pulses (Dal)",
    items: [
      { name: "Tur Dal", icon: Leaf, color: "bg-yellow-100 text-yellow-600" },
      { name: "Moong", icon: Sprout, color: "bg-leaf-100 text-leaf-600" },
      { name: "Chana", icon: Coffee, color: "bg-orange-100 text-orange-800" },
      { name: "Urad", icon: Leaf, color: "bg-gray-200 text-gray-800" },
    ]
  },
  {
    category: "Vegetables",
    items: [
      { name: "Onion", icon: Leaf, color: "bg-purple-100 text-purple-700" },
      { name: "Tomato", icon: Apple, color: "bg-red-100 text-red-700" },
      { name: "Potato", icon: Sprout, color: "bg-yellow-100 text-yellow-800" },
      { name: "Garlic", icon: Leaf, color: "bg-slate-100 text-slate-700" },
      { name: "Cabbage", icon: Leaf, color: "bg-leaf-100 text-leaf-700" },
      { name: "Brinjal", icon: Sprout, color: "bg-indigo-100 text-indigo-700" },
      { name: "Okra", icon: Leaf, color: "bg-leaf-100 text-leaf-700" },
    ]
  },
  {
    category: "Fruits",
    items: [
      { name: "Banana", icon: Sun, color: "bg-yellow-100 text-yellow-600" },
      { name: "Apple", icon: Apple, color: "bg-red-100 text-red-600" },
      { name: "Mango", icon: Leaf, color: "bg-orange-100 text-orange-600" },
      { name: "Grapes", icon: Sprout, color: "bg-purple-100 text-purple-800" },
      { name: "Papaya", icon: Sun, color: "bg-orange-50 text-orange-500" },
      { name: "Pomegranate", icon: Apple, color: "bg-rose-100 text-rose-700" },
    ]
  },
  {
    category: "Commercial & Oil Seeds",
    items: [
      { name: "Cotton", icon: Droplets, color: "bg-blue-100 text-blue-700" },
      { name: "Sugarcane", icon: Sprout, color: "bg-leaf-100 text-leaf-700" },
      { name: "Soyabean", icon: Leaf, color: "bg-lime-100 text-lime-700" },
      { name: "Groundnut", icon: Coffee, color: "bg-stone-100 text-stone-700" },
      { name: "Mustard", icon: Sun, color: "bg-yellow-200 text-yellow-800" },
      { name: "Sunflower", icon: Sun, color: "bg-amber-100 text-amber-600" },
    ]
  },
  {
    category: "Spices",
    items: [
      { name: "Turmeric", icon: Flame, color: "bg-yellow-200 text-yellow-700" },
      { name: "Red Chilli", icon: Flame, color: "bg-red-200 text-red-700" },
      { name: "Coriander", icon: Leaf, color: "bg-leaf-100 text-leaf-800" },
      { name: "Black Pepper", icon: Coffee, color: "bg-gray-200 text-gray-900" },
    ]
  }
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

export default function MandiMitraPage() {
  const navigate = useNavigate();
  const { content } = useLanguage();
  const [searchCrop, setSearchCrop] = useState("");
  const [mandiData, setMandiData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [insight, setInsight] = useState({
    insight: content?.mandiUi?.selectCropInsight ?? "Select a crop to see market insights",
    trend: "flat",
    percentage: 0,
  });

  const state = "Karnataka";
  const district = "Belgaum";
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (searchCrop.trim() === "") {
      setHasSearched(false);
      setMandiData([]);
      setHistoricalData([]);
      setCurrentPrice(null);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

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
      const modalPrices = result.data
        .map((p) => Number(p.modalPrice))
        .filter((n) => Number.isFinite(n));
      const avgPrice =
        modalPrices.length > 0
          ? modalPrices.reduce((sum, n) => sum + n, 0) / modalPrices.length
          : 0;

      const transformedData = result.data.map((item) => {
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
      setInsight(getMarketInsights(result.data, result.history));
    } else {
      setMandiData([]);
      setHistoricalData([]);
      setCurrentPrice(null);
      setInsight({
        insight:
          formatCopy(content?.mandiUi?.noMandiDataInsight, {
            crop: searchCrop,
            district,
            state,
          }) || `No mandi data found for "${searchCrop}" in ${district}, ${state}.`,
        trend: "flat",
        percentage: 0,
      });
    }
    setLoading(false);
  };

  const handleClearSearch = () => {
    setSearchCrop("");
  };

  return (
    <PageWrapper>
      <Header 
        title={content?.mandi?.title ?? "Mandi Mitra"} 
        subtitle={formatCopy(content?.mandiUi?.headerSubtitle, { district, state }) || `${district}, ${state}`} 
        showBack 
      />
      <div className="mx-auto max-w-5xl px-5 pb-12 md:px-8">

        {/* SEARCH SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-slate-200/60 bg-white p-5 shadow-sm md:p-6"
        >
          <h2 className="font-display text-lg font-black text-slate-900">
            {content?.mandiUi?.findTitle ?? "Find mandi prices"}
          </h2>
          <div className="relative mt-4">
            <SearchIcon size={20} className="absolute left-4 top-4 text-slate-400" />
            <input
              placeholder={content?.mandiUi?.searchPlaceholder ?? "Type or tap a crop below..."}
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 py-4 pl-12 pr-12 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-shadow focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
            {searchCrop && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-slate-700"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </motion.div>

        {/* DYNAMIC CONTENT AREA */}
        {!hasSearched ? (
          /* FARMER-FRIENDLY CROP CATALOG */
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="mt-8 space-y-8">
            <motion.div variants={itemVariants} className="flex items-start gap-4 rounded-[24px] border border-slate-200/60 bg-white p-5 shadow-sm">
              <div className="shrink-0 rounded-xl bg-emerald-50 p-2 text-emerald-700">
                <ArrowUpRight size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">{content?.mandiUi?.tipTitle ?? "Tip"}</h4>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  {content?.mandiUi?.tipBody ??
                    "Start by tapping a crop category below. You’ll see verified mandi prices and a clean trend view."}
                </p>
              </div>
            </motion.div>

            {CROP_CATALOG.map((group, idx) => (
              <motion.div variants={itemVariants} key={idx} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="pl-1 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                    {content?.mandiUi?.categories?.[group.category] ?? group.category}
                  </h4>
                  <div className="h-px flex-1 bg-slate-200/70" />
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {group.items.map((crop, cIdx) => {
                    const Icon = crop.icon;
                    return (
                      <button
                        key={cIdx}
                        onClick={() => setSearchCrop(crop.name)}
                        className="group relative flex items-center justify-between gap-3 rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50/60 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:ring-2 hover:ring-emerald-200/60 active:translate-y-0 overflow-hidden"
                      >
                        <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-200/40 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="pointer-events-none absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-sun-200/30 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />

                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${crop.color} ring-1 ring-black/5`}>
                              <Icon size={18} />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <span className="block truncate text-sm font-black text-slate-900">{crop.name}</span>
                            <span className="mt-0.5 block text-[10px] font-semibold text-slate-500">
                              {content?.mandiUi?.viewPricesTrend ?? "View prices & trend"}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.22em] text-slate-300 group-hover:text-emerald-700 transition-colors">
                            {content?.mandiUi?.open ?? "Open"}
                          </span>
                          <ChevronRight size={18} className="text-slate-300 transition group-hover:text-emerald-700" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* POST-SEARCH RESULTS */
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="mt-8">
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm md:p-8">
              <div className="absolute -right-8 -top-8 opacity-10">
                <Sprout size={140} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                {content?.mandiUi?.marketInsight ?? "Market insight"}
              </p>
              <p className="mt-3 font-display text-lg font-black leading-snug text-slate-900 md:text-xl md:leading-relaxed">
                {insight.insight}
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-600">
                {(content?.mandiUi?.basedOnRecent ?? "Based on recent mandi data for")}&nbsp;
                <span className="font-black text-slate-900">{searchCrop}</span>.
              </p>
            </motion.div>

            {/* TREND CARD WITH REAL GRAPH */}
            <motion.div variants={itemVariants} className="mt-6 rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm md:p-8">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                {formatCopy(content?.mandiUi?.averageLabel, { district }) || `${district} average`}
              </p>
              <h2 className="mt-1 font-display text-2xl font-black text-slate-900">
                {formatCopy(content?.mandiUi?.trendTitle, { crop: searchCrop }) || `${searchCrop} trend`}
              </h2>

              <div className="mt-4 flex items-end justify-between">
                <p className="font-display text-4xl font-black text-slate-900 md:text-5xl">₹{currentPrice || "---"}</p>
                <div className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-black ${insight.trend === "up" ? "bg-emerald-50 text-emerald-700" : insight.trend === "down" ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-600"}`}>
                  {insight.trend === "up" ? <ArrowUpRight size={18} /> : insight.trend === "down" ? <ArrowDownRight size={18} /> : null}
                  {insight.trend === "up" ? "+" : insight.trend === "down" ? "" : ""}{insight.percentage}%
                </div>
              </div>

              {/* REAL GRAPH */}
              {!loading && historicalData.length > 0 ? (
                <div className="mt-8 h-48 rounded-xl md:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                      <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: "11px", fontWeight: 800 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: "11px", fontWeight: 800 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "14px", color: "#0f172a", fontWeight: 800, padding: "10px 12px" }}
                        itemStyle={{ color: "#0f172a" }}
                        formatter={(value) => [`₹${value}`, "Price"]}
                        labelStyle={{ color: "#64748b", marginBottom: "4px", fontSize: "12px", textTransform: "uppercase", fontWeight: 900 }}
                      />
                      <Line type="monotone" dataKey="price" stroke="#0f766e" strokeWidth={3.5} dot={{ fill: "#0f766e", strokeWidth: 3, r: 5, stroke: "white" }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="mt-8 flex h-48 items-center justify-center rounded-2xl bg-slate-50 md:h-56">
                  {loading && (
                    <p className="text-sm font-black text-slate-600 animate-pulse">
                      {content?.mandiUi?.loadingTrend ?? "Loading trend..."}
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* LIST HEADER */}
            <motion.div variants={itemVariants} className="mb-4 mt-8 flex items-end justify-between gap-4 px-1">
              <div>
                <h2 className="font-display text-xl font-black text-slate-900">
                  {content?.mandiUi?.livePricesTitle ?? "Live mandi prices"}
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {content?.mandiUi?.livePricesSubtitle ?? "Market • Price • Trend • Distance"}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-700">
                {content?.mandiUi?.latest ?? "Latest"}
              </span>
            </motion.div>

            {/* CARDS */}
            <motion.div variants={containerVariants} className="space-y-4">
              {loading ? (
                <div className="rounded-[32px] border border-leaf-100 bg-white py-12 text-center shadow-sm">
                  <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-leaf-200 border-t-leaf-600"></div>
                  <p className="font-bold text-leaf-500">
                    {formatCopy(content?.mandiUi?.fetchingOfficial, { crop: searchCrop }) ||
                      `Fetching official prices for ${searchCrop}...`}
                  </p>
                </div>
              ) : mandiData.length > 0 ? (
                mandiData.map((item, i) => (
                  <motion.div variants={itemVariants} key={i} className="rounded-[28px] border border-slate-200/60 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-lg font-black leading-tight text-slate-900 md:text-xl truncate">{item.market}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <MapPin size={14} className="text-slate-500" /> {item.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.isLiveGovtData ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
                            <ShieldCheck size={12} /> {content?.mandiUi?.verified ?? "Verified"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">
                            <AlertCircle size={12} /> {content?.mandiUi?.estimate ?? "Estimate"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-4">
                      <StatCell label={content?.mandiUi?.pricePerQuintal ?? "Price / quintal"} value={item.price} strong />
                      <StatCell
                        label={content?.mandiUi?.trend ?? "Trend"}
                        value={`${item.trend}`}
                        right
                        tone={item.type === "up" ? "text-emerald-700" : "text-rose-700"}
                        icon={item.type === "up" ? ArrowUpRight : ArrowDownRight}
                      />
                      <StatCell label={content?.mandiUi?.distance ?? "Distance"} value={item.distance} right />
                      <div className="flex items-center justify-end">
                        <span
                          className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] ${
                            item.tagKey === "sellNow"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {item.tagKey === "sellNow"
                            ? content?.mandiUi?.sellNow ?? "SELL NOW"
                            : content?.mandiUi?.wait ?? "WAIT"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]">
                        <Phone size={18} /> {content?.mandiUi?.contactAgent ?? "Contact agent"}
                      </button>
                      <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-black text-white shadow-sm transition hover:bg-black active:scale-[0.99]">
                        <ArrowUpRight size={18} /> {content?.mandiUi?.save ?? "Save"}
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-[32px] border border-leaf-100 bg-white py-16 text-center shadow-sm">
                  <SearchIcon size={40} className="mx-auto mb-4 text-leaf-200" />
                  <p className="text-lg font-bold text-leaf-900">{content?.mandiUi?.noDataTitle ?? "No data found"}</p>
                  <p className="mb-6 mt-1 text-sm text-leaf-500">
                    {formatCopy(content?.mandiUi?.noDataBody, { crop: searchCrop }) ||
                      `We couldn't find active trades for ${searchCrop} in your area today.`}
                  </p>
                  <button onClick={handleClearSearch} className="rounded-xl bg-leaf-50 px-6 py-3 text-sm font-bold text-leaf-800 transition-colors hover:bg-leaf-100">
                    {content?.mandiUi?.browseOtherCrops ?? "Browse other crops"}
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

function StatCell({ label, value, strong, right, tone, icon: Icon }) {
  return (
    <div className={`rounded-2xl border border-slate-200/60 bg-slate-50 px-4 py-3 ${right ? "text-right" : ""}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <div className={`mt-1 flex items-center ${right ? "justify-end" : "justify-start"} gap-1.5`}>
        {Icon ? <Icon size={16} className={tone || "text-slate-500"} /> : null}
        <p className={`${strong ? "font-display text-xl font-black" : "text-sm font-black"} ${tone || "text-slate-900"}`}>
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