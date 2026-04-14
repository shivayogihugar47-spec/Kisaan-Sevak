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
      setInsight(getMarketInsights(result.data, result.history));
    } else {
      setMandiData([]);
      setHistoricalData([]);
      setCurrentPrice(null);
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

  return (
    <PageWrapper>
      <Header
        title={content?.mandi?.title ?? "Mandi Mitra"}
        subtitle={formatCopy(content?.mandiUi?.headerSubtitle, { district, state }) || `${district}, ${state}`}
        showBack
      />
      <div className="mx-auto max-w-5xl px-5 pb-12 md:px-8">

        {/* Search Section – Professional & Minimal */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
        >
          <h2 className="text-base font-semibold text-gray-900">
            {content?.mandiUi?.findTitle ?? "Find mandi prices"}
          </h2>
          <div className="relative mt-3">
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder={content?.mandiUi?.searchPlaceholder ?? "Type or tap a crop below..."}
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {searchCrop && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Dynamic Content */}
        {!hasSearched ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="mt-6 space-y-8">
            {/* Tip note – subtle */}
            <motion.div variants={itemVariants} className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-600">
              <span className="font-medium text-gray-900">{content?.mandiUi?.tipTitle ?? "Tip"}:</span>{" "}
              {content?.mandiUi?.tipBody ??
                "Tap any crop below to see verified mandi prices and trend insights."}
            </motion.div>

            {CROP_CATALOG.map((group, idx) => (
              <motion.div variants={itemVariants} key={idx} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {content?.mandiUi?.categories?.[group.category] ?? group.category}
                  </h4>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {group.items.map((crop, cIdx) => {
                    const Icon = crop.icon;
                    return (
                      <button
                        key={cIdx}
                        onClick={() => setSearchCrop(crop.name)}
                        className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <div className={`shrink-0 ${crop.color}`}>
                          <Icon size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                          {crop.name}
                        </span>
                        <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-gray-500" />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="mt-6 space-y-6">
            {/* Insight card – clean border-left accent */}
            <motion.div variants={itemVariants} className="rounded-lg border-l-4 border-emerald-500 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {content?.mandiUi?.marketInsight ?? "Market insight"}
              </p>
              <p className="mt-2 text-base font-medium text-gray-800 leading-relaxed">
                {insight.insight}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {content?.mandiUi?.basedOnRecent ?? "Based on recent mandi data for"}{" "}
                <span className="font-semibold text-gray-800">{searchCrop}</span>.
              </p>
            </motion.div>

            {/* Trend Card */}
            <motion.div variants={itemVariants} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {formatCopy(content?.mandiUi?.averageLabel, { district }) || `${district} average`}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">
                    {formatCopy(content?.mandiUi?.trendTitle, { crop: searchCrop }) || `${searchCrop} trend`}
                  </h3>
                </div>
                <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  insight.trend === "up" ? "bg-emerald-50 text-emerald-700" :
                  insight.trend === "down" ? "bg-rose-50 text-rose-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {insight.trend === "up" && <ArrowUpRight size={14} />}
                  {insight.trend === "down" && <ArrowDownRight size={14} />}
                  {insight.percentage}%
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">₹{currentPrice || "—"}</span>
                <span className="text-xs text-gray-500">/ quintal</span>
              </div>

              {!loading && historicalData.length > 0 ? (
                <div className="mt-6 h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} dy={6} />
                      <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(value) => [`₹${value}`, "Price"]}
                      />
                      <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : loading ? (
                <div className="mt-6 flex h-48 items-center justify-center rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500 animate-pulse">{content?.mandiUi?.loadingTrend ?? "Loading trend..."}</p>
                </div>
              ) : null}
            </motion.div>

            {/* Live Prices Header */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{content?.mandiUi?.livePricesTitle ?? "Live mandi prices"}</h2>
                <p className="text-xs text-gray-500">{content?.mandiUi?.livePricesSubtitle ?? "Market • Price • Trend • Distance"}</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium uppercase text-gray-600">
                {content?.mandiUi?.latest ?? "Latest"}
              </span>
            </div>

            {/* Price Cards – Professional Table-like layout */}
            <motion.div variants={containerVariants} className="space-y-3">
              {loading ? (
                <div className="rounded-lg border border-gray-100 bg-white py-12 text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600"></div>
                  <p className="text-sm text-gray-500">
                    {formatCopy(content?.mandiUi?.fetchingOfficial, { crop: searchCrop }) ||
                      `Fetching official prices for ${searchCrop}...`}
                  </p>
                </div>
              ) : mandiData.length > 0 ? (
                mandiData.map((item, i) => (
                  <motion.div variants={itemVariants} key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.market}</h3>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={12} /> {item.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.isLiveGovtData ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                            <AlertCircle size={10} /> Estimate
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <p className="text-xs text-gray-400">Price / quintal</p>
                        <p className="text-base font-semibold text-gray-900">{item.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Trend</p>
                        <p className={`inline-flex items-center gap-0.5 text-sm font-medium ${item.type === "up" ? "text-emerald-600" : "text-rose-600"}`}>
                          {item.type === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {item.trend}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Distance</p>
                        <p className="text-sm font-medium text-gray-700">{item.distance}</p>
                      </div>
                      <div className="flex justify-end">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                          item.tagKey === "sellNow" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {item.tagKey === "sellNow" ? "SELL NOW" : "WAIT"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => window.open(`tel:+919876543210`)}
                        className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <Phone size={14} className="inline mr-1" /> Contact agent
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-lg border border-gray-100 bg-white py-16 text-center">
                  <SearchIcon size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-gray-800">{content?.mandiUi?.noDataTitle ?? "No data found"}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatCopy(content?.mandiUi?.noDataBody, { crop: searchCrop }) ||
                      `We couldn't find active trades for ${searchCrop} in your area today.`}
                  </p>
                  <button onClick={handleClearSearch} className="mt-4 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
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