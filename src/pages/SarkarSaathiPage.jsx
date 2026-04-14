import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Landmark, MapPin, Phone, Search, ShieldCheck,
  Tractor, X, Droplets, Sun, Leaf, Activity, HeartPulse, Scale, Award,
  FileCheck, Calendar, Wallet, Globe, Bookmark, BookmarkCheck, Share2,
  GitCompare, ExternalLink, FileText, TrendingUp, Sprout, Trees, CloudRain,
  Zap, HardHat, Apple, Truck, Thermometer, Wind, Battery, Users, Lightbulb,
} from "lucide-react";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../context/LanguageContext";
import { supabase } from "../lib/supabase";

// Storage keys
const PROFILE_KEY = "kisaan-sevak-schemes-profile";
const FAVORITES_KEY = "kisaan-sevak-scheme-favorites";
const COMPARE_KEY = "kisaan-sevak-scheme-compare";
const RECENT_SEARCHES_KEY = "kisaan-sevak-recent-searches";

// Translations (English only for brevity – same structure as before)
const T = {
  en: {
    title: "Sarkar Saathi",
    subtitle: "Your personal guide to government schemes for farmers",
    searchPlaceholder: "Search schemes by name or keyword...",
    allSchemes: "All Schemes",
    savedSchemes: "Saved",
    compareSchemes: "Compare",
    categories: {
      Subsidies: "Subsidies", Insurance: "Insurance", AgriTech: "Agri-Tech",
      Loans: "Loans", Markets: "Markets", Energy: "Energy", Soil: "Soil",
      Water: "Water", Organic: "Organic", Livestock: "Livestock",
    },
    profileCardTitle: "Your Farm Profile",
    profileCardSub: "Tell us about your land and crops – we'll show what fits you best.",
    startProfile: "Start eligibility check",
    editProfile: "Edit profile",
    profileSummary: "{crop} • {land} acres • {district}",
    profileUnknown: "Not set",
    formTitle: "Farming Profile",
    formSub: "More details = better matches",
    landSize: "Land size (acres)",
    landPlaceholder: "e.g. 3.5",
    mainCrop: "Main crop",
    cropPlaceholder: "e.g. Onion, Cotton",
    district: "District",
    districtPlaceholder: "e.g. Belgaum",
    state: "State",
    statePlaceholder: "e.g. Karnataka",
    saveProfile: "Save profile",
    clearProfile: "Clear",
    eligibilityBasics: "Basic info",
    ownLandQ: "Do you own farm land?",
    aadhaarQ: "Do you have Aadhaar?",
    bankQ: "Do you have bank account?",
    cropSownQ: "Crop sown this season?",
    govtEmployeeQ: "Govt employee?",
    incomeTaxQ: "Income tax payer?",
    institutionalQ: "Institutional farmer?",
    supportTag: "📞 24/7 Helpline",
    supportTitle: "Need help applying?",
    supportSub: "Talk to a local Krishi Sahayak – free guidance.",
    callNow: "Call 9945443095",
    statuses: { eligible: "ELIGIBLE", check: "CHECK" },
    actions: { applyNow: "Apply now", save: "Save", share: "Share", compare: "Compare" },
    fields: { benefitAmount: "Benefit", tenure: "Tenure", target: "Target", funding: "Funding" },
    eligibilityScore: "Match score",
    requiredDocs: "Documents needed",
    stepsToApply: "How to apply",
    applyModalTitle: "Apply for {scheme}",
    shareText: "Check out this government scheme: {scheme} - {link}",
    recentSearches: "Recent",
    scoreHigh: "High match!",
    scoreMedium: "Partial match",
    scoreLow: "Check criteria",
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

// Eligibility score (0-100)
function getScore(profile, schemeKey) {
  if (!profile) return 0;
  const hasLand = profile.hasLand || safeNumber(profile.landSize) > 0;
  const hasAadhaar = profile.hasAadhaar;
  const hasBank = profile.hasBankAccount;
  const hasCrop = profile.hasCropSown;
  const isInst = profile.isInstitutional;
  const isGovt = profile.isGovtEmployee;
  const isTax = profile.isIncomeTaxPayer;

  if (schemeKey === "pmkisan" || schemeKey === "pmkmy") {
    let s = 0;
    if (hasLand) s += 30;
    if (!isInst) s += 20;
    if (!isGovt) s += 20;
    if (!isTax) s += 15;
    if (hasAadhaar && hasBank) s += 15;
    return s;
  }
  if (schemeKey === "pmfby") return (hasCrop ? 50 : 0) + (hasBank ? 50 : 0);
  if (schemeKey === "smam") return (hasLand ? 60 : 0) + (hasAadhaar ? 40 : 0);
  if (schemeKey === "pmkusum") return (hasLand ? 40 : 0) + (profile.wantsSolarPump ? 60 : 0);
  return 85;
}

export default function SarkarSaathiPage() {
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
    hasAadhaar: profile?.hasAadhaar ?? true,
    hasBankAccount: profile?.hasBankAccount ?? true,
    hasCropSown: profile?.hasCropSown ?? false,
    isInstitutional: profile?.isInstitutional ?? false,
    isGovtEmployee: profile?.isGovtEmployee ?? false,
    isIncomeTaxPayer: profile?.isIncomeTaxPayer ?? false,
    wantsSolarPump: profile?.wantsSolarPump ?? false,
  });

  const [liveSchemes, setLiveSchemes] = useState([]);

  function getIcon(cat) {
    const map = {
      Subsidies: Landmark, Insurance: ShieldCheck, AgriTech: Tractor, Loans: Wallet,
      Markets: Globe, Energy: Sun, Soil: Leaf, Water: Droplets, Organic: Sprout,
    };
    return map[cat] || Landmark;
  }

  const staticSchemes = [
    {
      key: "pmkisan",
      title: { en: "PM Kisan Samman Nidhi" },
      subTitle: { en: "Direct income support for all farmers" },
      category: "Subsidies",
      accent: "from-green-500 to-emerald-600",
      extra: { benefit: "₹6,000/year", target: "All small & marginal farmers" },
      documents: ["Aadhar", "Bank passbook", "Land records"],
      steps: ["Visit pmkisan.gov.in", "Enter land details", "Submit application", "Verify OTP"],
      link: "https://pmkisan.gov.in"
    },
    {
      key: "pmfby",
      title: { en: "Pradhan Mantri Fasal Bima Yojana" },
      subTitle: { en: "Crop insurance scheme with premium subsidy" },
      category: "Insurance",
      accent: "from-blue-500 to-cyan-600",
      extra: { benefit: "80% coverage", target: "All farmers" },
      documents: ["Crop documents", "Land records", "Bank details"],
      steps: ["Register at your bank", "Pay premium", "Upload crop details", "Claim in case of loss"],
      link: "https://pmfby.gov.in"
    },
    {
      key: "pmkmy",
      title: { en: "PM Krishi Sinchayee Yojana" },
      subTitle: { en: "Irrigation infrastructure development" },
      category: "Water",
      accent: "from-cyan-500 to-blue-600",
      extra: { benefit: "90% subsidy", target: "Farmers with irrigable land" },
      documents: ["Land records", "Survey plot", "Estimate for irrigation"],
      steps: ["Apply to District Water Authority", "Get site inspection", "Complete payment", "Get irrigation system"],
      link: "https://pmksy.gov.in"
    },
    {
      key: "smam",
      title: { en: "Pradhan Mantri Soil Health Card Scheme" },
      subTitle: { en: "Free soil testing and nutrient management" },
      category: "Soil",
      accent: "from-amber-600 to-yellow-500",
      extra: { benefit: "Free soil test", target: "All farmers" },
      documents: ["Land records", "Soil sample"],
      steps: ["Visit soil test lab", "Submit soil sample", "Get health card", "Follow recommendations"],
      link: "https://soilhealth.dac.gov.in"
    },
    {
      key: "pmkusum",
      title: { en: "Pradhan Mantri Kisan Urja Suraksha Utthaan Mahabhiyaan" },
      subTitle: { en: "Solar pumps scheme with subsidy" },
      category: "Energy",
      accent: "from-yellow-500 to-orange-600",
      extra: { benefit: "30-50% subsidy", target: "Farmers with land" },
      documents: ["Land records", "Aadhar", "Electricity bill"],
      steps: ["Apply online", "Technical inspection", "Pay contribution", "System installation"],
      link: "https://pmkusum.mnre.gov.in"
    },
    {
      key: "pkvy",
      title: { en: "Paramparagat Krishi Vikas Yojana" },
      subTitle: { en: "Organic farming promotion scheme" },
      category: "Organic",
      accent: "from-green-600 to-lime-500",
      extra: { benefit: "₹50,000/ha", target: "Farmers transitioning to organic" },
      documents: ["Land records", "Organic certification plan", "Bank details"],
      steps: ["Cluster formation", "Training participation", "Submit plan", "Get subsidy"],
      link: "https://midh.gov.in"
    },
    {
      key: "atma",
      title: { en: "Agricultural Technology Management Agency" },
      subTitle: { en: "Free training and technology transfer" },
      category: "AgriTech",
      accent: "from-green-500 to-teal-600",
      extra: { benefit: "Free training", target: "All farmers" },
      documents: ["Farmer ID"],
      steps: ["Register at ATMA center", "Attend workshops", "Implement technology", "Share experience"],
      link: "https://agritech.gov.in"
    },
    {
      key: "nfsm",
      title: { en: "National Food Security Mission" },
      subTitle: { en: "Seed and fertilizer support" },
      category: "Subsidies",
      accent: "from-amber-500 to-orange-600",
      extra: { benefit: "₹50% subsidy", target: "Farmers growing rice/wheat" },
      documents: ["Land records", "Aadhar", "Bank passbook"],
      steps: ["Apply to agriculture office", "Get approved seed", "Submit receipt", "Get reimbursement"],
      link: "https://nfsm.gov.in"
    },
    {
      key: "enam",
      title: { en: "Electronic National Agriculture Market" },
      subTitle: { en: "Online marketplace for farmers" },
      category: "Markets",
      accent: "from-purple-500 to-indigo-600",
      extra: { benefit: "Better prices", target: "All farmers with produce" },
      documents: ["Farmer registration", "Produce quality"],
      steps: ["Register on eNAM", "List produce", "Connect buyers", "Transact online"],
      link: "https://enam.gov.in"
    },
    {
      key: "dbt",
      title: { en: "Dairy Entrepreneurship Development Scheme" },
      subTitle: { en: "Support for dairy farming business" },
      category: "Loans",
      accent: "from-red-500 to-pink-600",
      extra: { benefit: "₹4,00,000 loan", target: "Dairy farmers" },
      documents: ["Business plan", "Land records", "Aadhar"],
      steps: ["Submit plan", "Bank appraisal", "Loan sanction", "Receive funds"],
      link: "https://dairy.gov.in"
    },
    {
      key: "rainfed",
      title: { en: "Pradhan Mantri Adaptation to Climate Change" },
      subTitle: { en: "Support for rainfed agriculture" },
      category: "Water",
      accent: "from-blue-600 to-cyan-500",
      extra: { benefit: "80% subsidy", target: "Rainfed farmers" },
      documents: ["Land records", "Crop plan"],
      steps: ["Apply through revenue office", "Field inspection", "Sanction", "Implementation"],
      link: "https://pmis.gov.in"
    },
    {
      key: "amrut",
      title: { en: "Accelerated Modified Rainfed Area Treatment" },
      subTitle: { en: "Soil and water conservation" },
      category: "Soil",
      accent: "from-teal-500 to-cyan-600",
      extra: { benefit: "100% subsidy", target: "Rainfed farmers" },
      documents: ["Land records", "Soil condition report"],
      steps: ["Apply to district office", "Field inspection", "Implement works", "Get subsidy"],
      link: "https://amrut.gov.in"
    },
    {
      key: "mnrega",
      title: { en: "MGNREGA - Mahatma Gandhi Rural Employment Guarantee" },
      subTitle: { en: "Employment and infrastructure on farms" },
      category: "Subsidies",
      accent: "from-indigo-500 to-purple-600",
      extra: { benefit: "₹100-500/day wages", target: "Agricultural laborers" },
      documents: ["Job card", "Bank account", "Work records"],
      steps: ["Apply for job card", "Register for work", "Complete work", "Get wages"],
      link: "https://mgnrega.nic.in"
    },
    {
      key: "kisancc",
      title: { en: "Kisan Credit Card Scheme" },
      subTitle: { en: "Easy agricultural credit for farmers" },
      category: "Loans",
      accent: "from-yellow-600 to-orange-500",
      extra: { benefit: "₹1L-₹5L credit", target: "All farmers" },
      documents: ["Land records", "Aadhar", "Bank account"],
      steps: ["Apply to bank", "Credit check", "Card issuance", "Use for inputs"],
      link: "https://kcc.gov.in"
    },
    {
      key: "floodmanagement",
      title: { en: "Flood Management and River Erosion Control" },
      subTitle: { en: "Protective measures for flood-prone areas" },
      category: "Water",
      accent: "from-blue-700 to-cyan-500",
      extra: { benefit: "100% funding", target: "Farmers in flood zones" },
      documents: ["Land records", "Flood history"],
      steps: ["Report to district office", "Assessment", "Work execution", "Support provided"],
      link: "https://wrd.gov.in"
    },
    {
      key: "pestmgmt",
      title: { en: "National Program for Organic Production" },
      subTitle: { en: "Pest management training and certification" },
      category: "Organic",
      accent: "from-green-600 to-emerald-500",
      extra: { benefit: "Free certification", target: "Organic farmers" },
      documents: ["Farm records", "Certification plan"],
      steps: ["Join farmer group", "Training", "Documentation", "Get certificate"],
      link: "https://npop.gov.in"
    },
    {
      key: "livestock",
      title: { en: "National Livestock Mission" },
      subTitle: { en: "Support for animal husbandry" },
      category: "Livestock",
      accent: "from-orange-500 to-red-600",
      extra: { benefit: "₹90% subsidy", target: "Livestock farmers" },
      documents: ["Animal records", "Farmer ID", "Land records"],
      steps: ["Apply to livestock dept", "Approval", "Animal purchase", "Support received"],
      link: "https://livestock.gov.in"
    },
    {
      key: "greenhouses",
      title: { en: "National Horticulture Mission - Polyhouse Scheme" },
      subTitle: { en: "Greenhouse farming for high-value crops" },
      category: "AgriTech",
      accent: "from-lime-500 to-green-600",
      extra: { benefit: "50-80% subsidy", target: "Horticulture farmers" },
      documents: ["Land records", "Project proposal", "Specifications"],
      steps: ["Submit proposal", "Approval", "Construction", "Get subsidy"],
      link: "https://midhorticulture.gov.in"
    },
    {
      key: "agroforestry",
      title: { en: "National Agroforestry Policy" },
      subTitle: { en: "Tree cultivation with crops - ecological income" },
      category: "Subsidies",
      accent: "from-green-700 to-lime-600",
      extra: { benefit: "₹20,000/ha", target: "Tree farming farmers" },
      documents: ["Land records", "Tree plantation plan"],
      steps: ["Submit plan", "Approval", "Plant trees", "Maintenance support"],
      link: "https://agroforestry.gov.in"
    },
    {
      key: "biotech",
      title: { en: "DBT Agri-Start Up Fund" },
      subTitle: { en: "Support for agriculture startups" },
      category: "AgriTech",
      accent: "from-purple-500 to-indigo-600",
      extra: { benefit: "₹10L funding", target: "Agri entrepreneurs" },
      documents: ["Business plan", "Resume", "Technical proposal"],
      steps: ["Submit proposal", "Evaluation", "Mentorship", "Fund release"],
      link: "https://dbt.gov.in"
    },
    {
      key: "hortmission",
      title: { en: "National Horticulture Mission" },
      subTitle: { en: "High-value crop production support" },
      category: "Subsidies",
      accent: "from-pink-500 to-rose-600",
      extra: { benefit: "₹50% subsidy", target: "Horticulture growers" },
      documents: ["Land records", "Crop plan"],
      steps: ["Apply to horticulture dept", "Guidance", "Implementation", "Support provided"],
      link: "https://horticulture.gov.in"
    },
    {
      key: "agrimech",
      title: { en: "Pradhan Mantri Agricultural Machinery Scheme" },
      subTitle: { en: "Machinery subsidy for farm operations" },
      category: "AgriTech",
      accent: "from-slate-600 to-slate-700",
      extra: { benefit: "₹10-50% subsidy", target: "All machinery farmers" },
      documents: ["Land records", "Aadhar", "Quotation"],
      steps: ["Select machinery", "Get quote", "Apply for subsidy", "Purchase and use"],
      link: "https://agrimech.gov.in"
    },
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase.from("government_schemes").select("*").eq("is_active", true);
        // Create a map of DB schemes for reference
        const dbMap = {};
        if (data?.length) {
          data.forEach(s => {
            if (s.key) dbMap[s.key] = s;
          });
        }
        // Merge all static schemes with any DB enhancements
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
      if (compareIds.length >= 3) { alert("Compare up to 3 schemes"); return; }
      setCompareIds([...compareIds, key]);
    }
    localStorage.setItem(COMPARE_KEY, JSON.stringify(compareIds));
  };

  const shareScheme = (s) => {
    const text = formatCopy(t.shareText, { scheme: s.title.en, link: s.link });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const openModal = (s) => setSelectedScheme(s);
  const closeModal = () => setSelectedScheme(null);

  const categories = [{ key: "ALL", label: t.allSchemes }, ...Object.entries(T.en.categories).map(([k, v]) => ({ key: k, label: v }))];

  return (
    <PageWrapper className="bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <Header title={t.title} subtitle={t.subtitle} location={profile?.district} showBack maxWidth="max-w-7xl" />
      <main className="mx-auto max-w-full px-4 py-8 md:px-8 space-y-8">
        {/* Top section: Search + Sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left – search & filters */}
          <div className="space-y-8">
            {/* Search + tabs */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl p-6">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={22} />
                <input
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl border border-emerald-100 focus:ring-2 focus:ring-emerald-300 outline-none text-slate-700"
                />
              </div>
              {recentSearches.length > 0 && !query && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-emerald-600 font-medium">{t.recentSearches}:</span>
                  {recentSearches.map(term => (
                    <button key={term} onClick={() => handleSearch(term)} className="text-xs bg-emerald-50 px-3 py-1 rounded-full text-emerald-700 hover:bg-emerald-100">
                      {term}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-4 mt-6 border-b border-emerald-100">
                {["all", "saved", "compare"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 px-2 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === tab ? "border-b-2 border-emerald-600 text-emerald-700" : "text-slate-400"}`}>
                    {tab === "all" && t.allSchemes} {tab === "saved" && `${t.savedSchemes} (${favorites.length})`} {tab === "compare" && `${t.compareSchemes} (${compareIds.length}/3)`}
                  </button>
                ))}
              </div>
              {activeTab === "all" && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button key={c.key} onClick={() => setActiveCategory(c.key)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === c.key ? "bg-emerald-700 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:bg-emerald-50"}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar – profile only */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-3xl p-6 text-white shadow-2xl">
              <h3 className="text-2xl font-bold">{t.profileCardTitle}</h3>
              <p className="text-emerald-200 text-sm mt-1">{t.profileCardSub}</p>
              <div className="bg-white/10 rounded-2xl p-4 my-6">
                <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">Your profile</p>
                <p className="text-lg font-bold mt-1">
                  {profile ? formatCopy(t.profileSummary, { crop: profile.crop || '---', land: profile.landSize || '---', district: profile.district || '---' }) : t.profileUnknown}
                </p>
              </div>
              <button onClick={() => setProfileOpen(true)} className="w-full py-3 bg-white text-emerald-800 rounded-xl font-bold hover:bg-emerald-50 transition">
                {profile ? t.editProfile : t.startProfile}
              </button>
            </div>
          </div>
        </div>

        {/* Scheme grid – full width below sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="schemes-grid">
              {filteredSchemes.length === 0 ? (
                <div className="col-span-full py-8 text-center bg-white/50 rounded-3xl text-slate-500 font-semibold">No schemes found</div>
              ) : (
                filteredSchemes.map(scheme => (
                  <motion.div key={scheme.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-emerald-100/50">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${scheme.accent} text-white shadow-md`}>
                          {scheme.icon && <scheme.icon size={28} />}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => toggleFavorite(scheme.key)} className="p-1.5 rounded-full hover:bg-emerald-50">
                            {scheme.isFavorite ? <BookmarkCheck size={18} className="text-emerald-600" /> : <Bookmark size={18} className="text-slate-400" />}
                          </button>
                          <button onClick={() => toggleCompare(scheme.key)} className="p-1.5 rounded-full hover:bg-emerald-50">
                            <GitCompare size={18} className={scheme.isInCompare ? "text-emerald-600" : "text-slate-400"} />
                          </button>
                          <button onClick={() => shareScheme(scheme)} className="p-1.5 rounded-full hover:bg-emerald-50">
                            <Share2 size={18} className="text-slate-400" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mt-4 text-slate-800">{typeof scheme.title === 'object' ? (scheme.title.en || 'Untitled') : (scheme.title || 'Untitled')}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{typeof scheme.subTitle === 'object' ? (scheme.subTitle.en || '') : (scheme.subTitle || '')}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Award size={14} className={scheme.score >= 70 ? "text-emerald-600" : scheme.score >= 40 ? "text-amber-500" : "text-red-400"} />
                        <span className="text-xs font-semibold">{t.eligibilityScore}: {scheme.score}%</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${scheme.score >= 70 ? "bg-emerald-500" : scheme.score >= 40 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${scheme.score}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-emerald-50/50 rounded-xl p-2"><p className="text-[10px] font-bold text-slate-400">Benefit</p><p className="text-xs font-bold text-slate-700">{scheme?.extra?.benefit || 'N/A'}</p></div>
                        <div className="bg-emerald-50/50 rounded-xl p-2"><p className="text-[10px] font-bold text-slate-400">Target</p><p className="text-xs font-bold text-slate-700">{scheme?.extra?.target || 'N/A'}</p></div>
                      </div>
                      <button onClick={() => openModal(scheme)} className="mt-5 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition">
                        {t.actions.applyNow} <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
        </main>

      {/* Profile modal – same as previous but with improved styling */}
      <AnimatePresence>
        {profileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setProfileOpen(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white p-6 border-b border-emerald-100 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-emerald-800">{t.formTitle}</h3>
                <button onClick={() => setProfileOpen(false)} className="p-2 rounded-full hover:bg-emerald-50"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label={t.landSize} value={draft.landSize} type="number" onChange={v => setDraft(p => ({ ...p, landSize: v }))} />
                  <Field label={t.mainCrop} value={draft.crop} onChange={v => setDraft(p => ({ ...p, crop: v }))} />
                  <Field label={t.district} value={draft.district} onChange={v => setDraft(p => ({ ...p, district: v }))} />
                  <Field label={t.state} value={draft.state} onChange={v => setDraft(p => ({ ...p, state: v }))} />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-emerald-700">Basic eligibility</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Toggle label={t.ownLandQ} checked={draft.hasLand} onChange={v => setDraft(p => ({ ...p, hasLand: v }))} />
                    <Toggle label={t.aadhaarQ} checked={draft.hasAadhaar} onChange={v => setDraft(p => ({ ...p, hasAadhaar: v }))} />
                    <Toggle label={t.bankQ} checked={draft.hasBankAccount} onChange={v => setDraft(p => ({ ...p, hasBankAccount: v }))} />
                    <Toggle label={t.cropSownQ} checked={draft.hasCropSown} onChange={v => setDraft(p => ({ ...p, hasCropSown: v }))} />
                    <Toggle label={t.govtEmployeeQ} checked={draft.isGovtEmployee} onChange={v => setDraft(p => ({ ...p, isGovtEmployee: v }))} />
                    <Toggle label={t.incomeTaxQ} checked={draft.isIncomeTaxPayer} onChange={v => setDraft(p => ({ ...p, isIncomeTaxPayer: v }))} />
                    <Toggle label={t.institutionalQ} checked={draft.isInstitutional} onChange={v => setDraft(p => ({ ...p, isInstitutional: v }))} />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-emerald-100 flex gap-3">
                <button onClick={() => { setDraft({ landSize: profile?.landSize ?? "", crop: profile?.crop ?? "", district: profile?.district ?? "", state: profile?.state ?? "", hasLand: profile?.hasLand ?? false, hasAadhaar: profile?.hasAadhaar ?? true, hasBankAccount: profile?.hasBankAccount ?? true, hasCropSown: profile?.hasCropSown ?? false, isInstitutional: profile?.isInstitutional ?? false, isGovtEmployee: profile?.isGovtEmployee ?? false, isIncomeTaxPayer: profile?.isIncomeTaxPayer ?? false, wantsSolarPump: profile?.wantsSolarPump ?? false, }); }} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Reset</button>
                <button onClick={() => { setProfile(null); localStorage.removeItem(PROFILE_KEY); setProfileOpen(false); }} className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold">{t.clearProfile}</button>
                <button onClick={() => { setProfile({ ...draft }); localStorage.setItem(PROFILE_KEY, JSON.stringify(draft)); setProfileOpen(false); }} className="flex-1 py-3 bg-emerald-700 text-white rounded-xl font-bold">{t.saveProfile}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Application modal */}
      <AnimatePresence>
        {selectedScheme && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white p-6 border-b border-emerald-100 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-emerald-800">{formatCopy(t.applyModalTitle, { scheme: typeof selectedScheme?.title === 'object' ? selectedScheme.title.en : selectedScheme?.title || 'Scheme' })}</h3>
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-emerald-50"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-emerald-50 rounded-2xl p-4">
                  <h4 className="font-bold text-emerald-800 flex items-center gap-2"><FileText size={18} /> {t.requiredDocs}</h4>
                  <ul className="mt-2 space-y-1">
                    {selectedScheme.documents?.map((doc, i) => <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle2 size={14} className="text-emerald-600" /> {doc}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-2"><TrendingUp size={18} /> {t.stepsToApply}</h4>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-slate-700">
                    {selectedScheme.steps?.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </div>
                {selectedScheme.link && <a href={selectedScheme.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-800">Open official portal <ExternalLink size={16} /></a>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

// Helper components
function Field({ label, value, type = "text", onChange }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 mb-1">{label}</p>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-300 outline-none" />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${checked ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}>
      <span className="text-sm font-medium">{label}</span>
      <div className={`w-10 h-5 rounded-full relative transition-all ${checked ? "bg-emerald-600" : "bg-slate-300"}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${checked ? "right-0.5" : "left-0.5"}`} />
      </div>
    </button>
  );
}