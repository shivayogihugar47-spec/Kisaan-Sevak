import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Shield, MapPin, Phone, Search, ShieldCheck,
  Tractor, X, Droplets, Sun, Leaf, Activity, HeartPulse, Scale, Award,
  FileCheck, Calendar, Wallet, Globe, Bookmark, BookmarkCheck, Share2,
  GitCompare, ExternalLink, FileText, TrendingUp, Sprout, Trees, CloudRain,
  Zap, HardHat, Apple, Truck, Thermometer, Wind, Battery, Users, AlertCircle, Home,
} from "lucide-react";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../context/LanguageContext";
import { supabase } from "../lib/supabase";

// Storage keys
const PROFILE_KEY = "kisaan-sevak-insurance-profile";
const FAVORITES_KEY = "kisaan-sevak-insurance-favorites";
const COMPARE_KEY = "kisaan-sevak-insurance-compare";
const RECENT_SEARCHES_KEY = "kisaan-sevak-insurance-searches";

// Translations
// Translations
const T = {
  en: {
    title: "Agri Insurance",
    subtitle: "Government and state agricultural insurance schemes",
    searchPlaceholder: "Search insurance by name or crop...",
    allSchemes: "All Insurance",
    savedSchemes: "Saved",
    compareSchemes: "Compare",
    categories: {
      CropInsurance: "Crop Insurance",
      LivestockInsurance: "Livestock Insurance",
      PropertyInsurance: "Farm Property",
      ProfitInsurance: "Profit Insurance",
      DisasterInsurance: "Disaster Cover",
    },
    profileCardTitle: "Your Profile",
    profileCardSub: "Set up your details to find the best insurance for you.",
    startProfile: "Set insurance profile",
    editProfile: "Edit profile",
    profileSummary: "{crop} • {land} acres • {district}",
    profileUnknown: "Not set",
    formTitle: "Insurance Profile",
    formSub: "Help us match you with suitable schemes",
    landSize: "Land size (acres)",
    landPlaceholder: "e.g. 3.5",
    mainCrop: "Main crop",
    cropPlaceholder: "e.g. Cotton, Paddy",
    district: "District",
    districtPlaceholder: "e.g. Belgaum",
    state: "State",
    statePlaceholder: "e.g. Karnataka",
    saveProfile: "Save profile",
    clearProfile: "Clear",
    resetProfile: "Reset",
    supportTag: "📞 Insurance Support",
    supportTitle: "Need insurance help?",
    supportSub: "Call government insurance helpline for guidance.",
    callNow: "Call 1800-267-5000",
    statuses: { eligible: "ELIGIBLE", check: "CHECK" },
    actions: { applyNow: "Apply now", save: "Save", share: "Share", compare: "Compare" },
    fields: { premium: "Premium", coverage: "Coverage", tenure: "Tenure", target: "Target" },
    eligibilityScore: "Suitability Score",
    requiredDocs: "Documents needed",
    stepsToApply: "How to enroll",
    applyModalTitle: "Enroll for {scheme}",
    shareText: "Check out this agricultural insurance scheme: {scheme}",
    recentSearches: "Recent",
    scoreLow: "Not covered",
    scoreMedium: "Partial fit",
    scoreHigh: "Strong fit",
  },
};

function formatCopy(template, vars) {
  if (!template) return "";
  return template.replace(/\{(\w+)\}/g, (_, k) => vars?.[k] ?? "");
}

function safeNumber(v) {
  const n = Number(v);
  return isFinite(n) ? n : null;
}

// Get suitability score
function getScore(profile, schemeKey) {
  if (!profile) return 0;
  const hasLand = profile.hasLand || safeNumber(profile.landSize) > 0;
  const hasCrop = profile.hasCropSown;

  if (schemeKey === "pmfby") return (hasCrop ? 60 : 0) + (hasLand ? 40 : 0);
  if (schemeKey === "rwbcis") return (hasCrop ? 50 : 0) + (hasLand ? 50 : 0);
  if (schemeKey === "upis") return (hasLand ? 70 : 0) + (hasCrop ? 30 : 0);
  if (schemeKey === "aicorganic") return (hasCrop ? 60 : 0) + (hasLand ? 40 : 0);
  if (schemeKey === "horti") return (hasCrop ? 70 : 0) + (hasLand ? 30 : 0);
  if (schemeKey === "livestock") return (profile.hasLivestock ? 100 : 30);
  if (schemeKey === "poultry") return (profile.isPoultryFarmer ? 100 : 30);
  if (schemeKey === "fishery") return (profile.isFisheryFarmer ? 100 : 20);
  if (schemeKey === "property") return (hasLand ? 80 : 0) + (hasCrop ? 20 : 0);
  return 75;
}

export default function AgriInsure() {
  const { language } = useLanguage();
  const t = T[language] || T.en;

  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]"); } catch { return []; }
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)); } catch { return null; }
  });
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
  });
  const [compareIds, setCompareIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]"); } catch { return []; }
  });
  const [selectedScheme, setSelectedScheme] = useState(null);

  const [draft, setDraft] = useState({
    landSize: profile?.landSize ?? "",
    crop: profile?.crop ?? "",
    district: profile?.district ?? "",
    state: profile?.state ?? "",
    hasLand: profile?.hasLand ?? false,
    hasCropSown: profile?.hasCropSown ?? false,
    hasLivestock: profile?.hasLivestock ?? false,
    isPoultryFarmer: profile?.isPoultryFarmer ?? false,
    isFisheryFarmer: profile?.isFisheryFarmer ?? false,
  });

  const [liveSchemes, setLiveSchemes] = useState([]);

  function getIcon(cat) {
    const map = {
      CropInsurance: Shield,
      LivestockInsurance: Truck,
      PropertyInsurance: Home,
      ProfitInsurance: TrendingUp,
      DisasterInsurance: AlertCircle,
    };
    return map[cat] || Shield;
  }

  const staticSchemes = [
    {
      key: "pmfby",
      title: { en: "Pradhan Mantri Fasal Bima Yojana" },
      subTitle: { en: "Comprehensive crop insurance scheme" },
      category: "CropInsurance",
      accent: "from-blue-500 to-cyan-600",
      extra: { premium: "₹100-1000/acre", coverage: "80% coverage" },
      documents: ["Crop receipt", "Land records", "Bank account", "Aadhar"],
      steps: ["Visit authorized bank", "Fill form", "Submit documents", "Receive policy"],
      link: "https://pmfby.gov.in"
    },
    {
      key: "rwbcis",
      title: { en: "Rainfall Weather-Based Crop Insurance Scheme" },
      subTitle: { en: "Weather-indexed insurance for crops" },
      category: "CropInsurance",
      accent: "from-cyan-500 to-blue-600",
      extra: { premium: "₹100-800/acre", coverage: "Weather protection" },
      documents: ["Land records", "Crop details", "Bank account", "Aadhar"],
      steps: ["Contact insurance company", "Select rainfall index", "Pay premium", "Get certificate"],
      link: "https://pmfby.gov.in"
    },
    {
      key: "upis",
      title: { en: "Unified Package Insurance Scheme" },
      subTitle: { en: "Multi-risk crop and asset protection" },
      category: "CropInsurance",
      accent: "from-purple-500 to-indigo-600",
      extra: { premium: "₹150-1200/acre", coverage: "Crop + Equipment" },
      documents: ["Land records", "Crop plan", "Equipment details", "Bank account"],
      steps: ["Apply online", "Get inspection", "Premium assessment", "Policy issuance"],
      link: "https://pmfby.gov.in"
    },
    {
      key: "aicorganic",
      title: { en: "AIC - Organic Farm Insurance" },
      subTitle: { en: "Insurance for certified organic farms" },
      category: "CropInsurance",
      accent: "from-green-600 to-emerald-500",
      extra: { premium: "₹80-600/acre", coverage: "Organic certification" },
      documents: ["Organic certificate", "Land records", "Farm plan", "Aadhar"],
      steps: ["Submit organic certificate", "Farm inspection", "Premium quoted", "Policy approved"],
      link: "https://www.aicofindia.com/"
    },
    {
      key: "horti",
      title: { en: "National Horticulture Insurance Scheme" },
      subTitle: { en: "Insurance for fruits, vegetables, spices" },
      category: "CropInsurance",
      accent: "from-pink-500 to-rose-600",
      extra: { premium: "₹200-2500/acre", coverage: "High-value crops" },
      documents: ["Land records", "Horticulture certificate", "Crop plan", "Photo ID"],
      steps: ["Apply to horticulture dept", "Crop verification", "Insurance quotation", "Enroll"],
      link: "https://horticulture.gov.in"
    },
    {
      key: "spices",
      title: { en: "Spices Board Insurance Cover" },
      subTitle: { en: "Exclusive insurance for spice cultivation" },
      category: "CropInsurance",
      accent: "from-red-600 to-orange-500",
      extra: { premium: "₹250-3000/acre", coverage: "Spice crops protected" },
      documents: ["Spices registration", "Land records", "Crop details", "Bank details"],
      steps: ["Register with Spices Board", "Submit documentation", "Get premium", "Insurance active"],
      link: "https://spicesboard.gov.in"
    },
    {
      key: "livestock",
      title: { en: "Rashtriya Pashudhan Bima Yojana" },
      subTitle: { en: "Livestock and dairy animal insurance" },
      category: "LivestockInsurance",
      accent: "from-amber-600 to-yellow-500",
      extra: { premium: "₹50-500/animal", coverage: "Loss of animals" },
      documents: ["Animal registration", "Health certificate", "Owner ID", "Bank account"],
      steps: ["Register animals", "Health check", "Premium payment", "Coverage activated"],
      link: "https://livestock.gov.in"
    },
    {
      key: "poultry",
      title: { en: "National Poultry Insurance Scheme" },
      subTitle: { en: "Insurance coverage for poultry farming" },
      category: "LivestockInsurance",
      accent: "from-yellow-600 to-amber-500",
      extra: { premium: "₹10-100/bird", coverage: "Disease and mortality" },
      documents: ["Farm registration", "Bird count certificate", "Bank details", "Photo ID"],
      steps: ["Register poultry farm", "Declare bird count", "Pay premium", "Insurance begins"],
      link: "https://agriculture.gov.in"
    },
    {
      key: "fishery",
      title: { en: "Fisheries Insurance Scheme" },
      subTitle: { en: "Insurance for fish farming and aquaculture" },
      category: "LivestockInsurance",
      accent: "from-teal-500 to-cyan-600",
      extra: { premium: "₹100-1000/pond", coverage: "Fish loss protection" },
      documents: ["Pond registration", "Fish stocking certificate", "Water quality", "Bank details"],
      steps: ["Register pond", "Stocking details", "Premium calculation", "Enrollment complete"],
      link: "https://fisheries.gov.in"
    },
    {
      key: "property",
      title: { en: "Farm Property Insurance" },
      subTitle: { en: "Coverage for farm buildings and structures" },
      category: "PropertyInsurance",
      accent: "from-slate-600 to-slate-700",
      extra: { premium: "₹200-5000/year", coverage: "Buildings protected" },
      documents: ["Property documents", "Building photos", "Valuation", "Land records"],
      steps: ["Submit property details", "Physical survey", "Valuation done", "Policy issued"],
      link: "https://agriculture.gov.in"
    },
    {
      key: "equipment",
      title: { en: "Agricultural Equipment Insurance" },
      subTitle: { en: "Protection for farm machinery and tools" },
      category: "PropertyInsurance",
      accent: "from-gray-600 to-gray-700",
      extra: { premium: "₹300-10000/year", coverage: "Machinery protected" },
      documents: ["Equipment list", "Purchase bills", "Photos", "Valuation certificate"],
      steps: ["List equipment", "Photo documentation", "Get valuation", "Insurance approved"],
      link: "https://agriculture.gov.in"
    },
    {
      key: "profit",
      title: { en: "Bhavanter Bhugtan Yojana" },
      subTitle: { en: "Price support and profit insurance" },
      category: "ProfitInsurance",
      accent: "from-green-500 to-teal-600",
      extra: { premium: "Variable", coverage: "Price guarantee" },
      documents: ["Crop proof", "Market rates", "Harvest certificate", "Land records"],
      steps: ["Register crop", "Declare quantity", "Track prices", "Get difference payment"],
      link: "https://agriculture.gov.in"
    },
    {
      key: "disaster",
      title: { en: "Pradhan Mantri Disaster Relief Fund" },
      subTitle: { en: "Emergency relief for natural disasters" },
      category: "DisasterInsurance",
      accent: "from-red-500 to-orange-600",
      extra: { premium: "Free", coverage: "Disaster losses" },
      documents: ["Loss assessment", "Land records", "Photos", "Revenue proof"],
      steps: ["Report to district", "Damage survey", "Assessment done", "Relief distributed"],
      link: "https://disastermgmt.gov.in"
    },
    {
      key: "drought",
      title: { en: "Drought Relief and Irrigation Insurance" },
      subTitle: { en: "Protection during drought years" },
      category: "DisasterInsurance",
      accent: "from-yellow-600 to-orange-500",
      extra: { premium: "₹50-500/acre", coverage: "Drought losses" },
      documents: ["Land records", "Rainfall data", "Crop details", "Bank account"],
      steps: ["Enroll before drought", "Rainfall monitoring", "Claim assessment", "Payout"],
      link: "https://agriculture.gov.in"
    },
    {
      key: "flood",
      title: { en: "Flood Risk and Inundation Insurance" },
      subTitle: { en: "Coverage for flood-prone agricultural areas" },
      category: "DisasterInsurance",
      accent: "from-blue-600 to-cyan-500",
      extra: { premium: "₹100-800/acre", coverage: "Flood damage" },
      documents: ["Land records", "Flood history", "Location proof", "Bank details"],
      steps: ["Apply if in flood zone", "Risk assessment", "Premium determined", "Policy active"],
      link: "https://agriculture.gov.in"
    },
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase.from("government_schemes").select("*").eq("is_active", true).limit(50);
        const dbMap = {};
        if (data?.length) {
          data.forEach(s => {
            if (s.key) dbMap[s.key] = s;
          });
        }
        const merged = staticSchemes.map(staticScheme => {
          const dbScheme = dbMap[staticScheme.key];
          return {
            ...staticScheme,
            ...dbScheme,
            icon: getIcon(staticScheme.category),
            title: dbScheme?.title || staticScheme.title,
            subTitle: dbScheme?.subTitle || staticScheme.subTitle,
            extra: dbScheme?.extra || staticScheme.extra,
          };
        });
        if (merged.length > 0) setLiveSchemes(merged);
      } catch (e) { console.warn(e); }
    };
    fetch();
  }, []);

  const schemes = useMemo(() => (liveSchemes.length ? liveSchemes : staticSchemes), [liveSchemes]);

  const filteredSchemes = useMemo(() => {
    let filtered = schemes;
    if (activeTab === "saved") filtered = filtered.filter(s => favorites.includes(s.key));
    else if (activeTab === "compare") filtered = filtered.filter(s => compareIds.includes(s.key));
    else {
      if (activeCategory !== "ALL") filtered = filtered.filter(s => s.category === activeCategory);
      if (query.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter(s => {
          const title = typeof s.title === 'object' ? s.title.en : s.title;
          const subtitle = typeof s.subTitle === 'object' ? s.subTitle.en : s.subTitle;
          return (title?.toLowerCase().includes(q) || subtitle?.toLowerCase().includes(q));
        });
      }
    }
    return filtered.map(s => ({
      ...s,
      score: getScore(profile, s.key),
      isFavorite: favorites.includes(s.key),
      isInCompare: compareIds.includes(s.key),
    }));
  }, [schemes, activeCategory, activeTab, query, favorites, compareIds, profile]);

  const handleSearch = (val) => {
    setQuery(val);
    if (val.trim() && !recentSearches.includes(val.trim())) {
      const upd = [val.trim(), ...recentSearches.filter(s => s !== val.trim())].slice(0, 5);
      setRecentSearches(upd);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(upd));
    }
  };

  const toggleFavorite = (key) => {
    const newFav = favorites.includes(key) ? favorites.filter(k => k !== key) : [...favorites, key];
    setFavorites(newFav);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFav));
  };

  const toggleCompare = (key) => {
    if (compareIds.includes(key)) {
      setCompareIds(compareIds.filter(k => k !== key));
    } else {
      if (compareIds.length >= 3) { alert("Compare up to 3 insurance schemes"); return; }
      setCompareIds([...compareIds, key]);
    }
    localStorage.setItem(COMPARE_KEY, JSON.stringify(compareIds));
  };

  const shareScheme = (s) => {
    const text = formatCopy(t.shareText, { scheme: typeof s.title === 'object' ? s.title.en : s.title });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const openModal = (s) => setSelectedScheme(s);
  const closeModal = () => setSelectedScheme(null);

  const saveProfile = () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(draft));
    setProfile(draft);
    setProfileOpen(false);
  };

  const clearDraft = () => {
    setDraft({
      landSize: "",
      crop: "",
      district: "",
      state: "",
      hasLand: false,
      hasCropSown: false,
      hasLivestock: false,
      isPoultryFarmer: false,
      isFisheryFarmer: false,
    });
  };

  const resetProfile = () => {
    clearDraft();
    localStorage.removeItem(PROFILE_KEY);
    setProfile(null);
    setProfileOpen(false);
  };

  const categories = [
    { key: "ALL", label: t.allSchemes },
    ...Object.entries(t.categories).map(([k, v]) => ({ key: k, label: v }))
  ];

  return (
    <PageWrapper className="bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Header title={t.title} subtitle={t.subtitle} location={profile?.district} showBack maxWidth="max-w-7xl" />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t.profileCardTitle}</h3>
              <p className="text-sm text-slate-600">{t.profileCardSub}</p>
            </div>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
            >
              {profile ? t.editProfile : t.startProfile}
            </button>
          </div>
          {profile && (
            <p className="text-sm font-medium text-slate-700">
              {formatCopy(t.profileSummary, {
                crop: profile.crop || t.profileUnknown,
                land: profile.landSize || t.profileUnknown,
                district: profile.district || t.profileUnknown,
              })}
            </p>
          )}
        </motion.div>

        {/* Profile Form */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 rounded-2xl bg-white p-6 border border-slate-200 shadow-md"
            >
              <h4 className="text-lg font-bold text-slate-900 mb-1">{t.formTitle}</h4>
              <p className="text-sm text-slate-600 mb-4">{t.formSub}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder={t.landPlaceholder}
                  value={draft.landSize}
                  onChange={(e) => setDraft({ ...draft, landSize: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder={t.cropPlaceholder}
                  value={draft.crop}
                  onChange={(e) => setDraft({ ...draft, crop: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder={t.districtPlaceholder}
                  value={draft.district}
                  onChange={(e) => setDraft({ ...draft, district: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder={t.statePlaceholder}
                  value={draft.state}
                  onChange={(e) => setDraft({ ...draft, state: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { key: "hasLand", label: "Own land?" },
                  { key: "hasCropSown", label: "Crop sown?" },
                  { key: "hasLivestock", label: "Livestock?" },
                  { key: "isPoultryFarmer", label: "Poultry?" },
                  { key: "isFisheryFarmer", label: "Fishery?" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft[key]}
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={saveProfile}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
                >
                  {t.saveProfile}
                </button>
                <button
                  onClick={clearDraft}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                >
                  {t.clearProfile}
                </button>
                <button
                  onClick={resetProfile}
                  className="flex-1 rounded-lg border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
                >
                  {t.resetProfile}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setActiveTab("all"); }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === cat.key
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 text-slate-700 hover:border-blue-400"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200">
            {[
              { key: "all", label: "All Insurance" },
              { key: "saved", label: `Saved (${favorites.length})` },
              { key: "compare", label: `Compare (${compareIds.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Insurance Cards Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatePresence>
            {filteredSchemes.length > 0 ? (
              filteredSchemes.map((scheme, idx) => (
                <motion.div
                  key={scheme.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-xl border bg-white overflow-hidden hover:shadow-xl transition-all cursor-pointer group ${
                    scheme.score >= 75 ? "border-blue-300 bg-gradient-to-br from-blue-50" : "border-slate-200"
                  }`}
                  onClick={() => openModal(scheme)}
                >
                  <div className={`h-2 bg-gradient-to-r ${scheme.accent}`} />
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                        {scheme.category}
                      </span>
                      {scheme.score >= 75 && (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[8px] font-bold text-green-700">
                          <CheckCircle2 size={10} /> Good fit
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2">
                      {typeof scheme.title === 'object' ? scheme.title.en : scheme.title}
                    </h4>
                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                      {typeof scheme.subTitle === 'object' ? scheme.subTitle.en : scheme.subTitle}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                      <div className="bg-slate-50 rounded p-2">
                        <p className="text-slate-500 font-medium">Premium</p>
                        <p className="font-bold text-slate-900">{scheme.extra?.premium || "Variable"}</p>
                      </div>
                      <div className="bg-slate-50 rounded p-2">
                        <p className="text-slate-500 font-medium">Coverage</p>
                        <p className="font-bold text-slate-900">{scheme.extra?.coverage || "Standard"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(scheme.key);
                        }}
                        className="flex-1 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition"
                      >
                        {scheme.isFavorite ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(scheme.key);
                        }}
                        className="flex-1 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition"
                      >
                        <GitCompare size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareScheme(scheme);
                        }}
                        className="flex-1 rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Search size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">No insurance schemes found</p>
                <p className="text-sm text-slate-500">Try adjusting your filters or search</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Support Section */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-green-200 p-8 text-center">
          <Phone size={32} className="mx-auto mb-3 text-green-600" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">{t.supportTitle}</h3>
          <p className="text-sm text-slate-600 mb-4">{t.supportSub}</p>
          <a href="tel:1800-267-5000" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700">
            <Phone size={18} /> {t.callNow}
          </a>
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedScheme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:w-full md:max-w-2xl bg-white rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {typeof selectedScheme.title === 'object' ? selectedScheme.title.en : selectedScheme.title}
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      {typeof selectedScheme.subTitle === 'object' ? selectedScheme.subTitle.en : selectedScheme.subTitle}
                    </p>
                  </div>
                  <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-lg bg-slate-100 p-4">
                    <p className="text-xs text-slate-600 font-medium">Premium</p>
                    <p className="text-lg font-bold text-slate-900">{selectedScheme.extra?.premium}</p>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-4">
                    <p className="text-xs text-slate-600 font-medium">Coverage</p>
                    <p className="text-lg font-bold text-slate-900">{selectedScheme.extra?.coverage}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <FileText size={18} /> {t.requiredDocs}
                    </h4>
                    <ul className="space-y-1">
                      {selectedScheme.documents?.map((doc, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-green-600" /> {doc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Calendar size={18} /> {t.stepsToApply}
                    </h4>
                    <ol className="space-y-2">
                      {selectedScheme.steps?.map((step, i) => (
                        <li key={i} className="text-sm text-slate-600 flex gap-3">
                          <span className="font-bold text-blue-600 min-w-6">{i + 1}.</span> {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <a
                    href={selectedScheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 w-full justify-center"
                  >
                    {t.actions.applyNow} <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}