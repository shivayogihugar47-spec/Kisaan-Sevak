import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Filter,
  Info,
  Landmark,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Tractor,
  CreditCard,
  X,
  Droplets,
  Sun,
  Leaf,
  Sprout,
  Waves,
  Trees,
  CloudRain,
  Activity,
  HeartPulse,
  Scale,
  Zap,
  HardHat,
  Apple,
  FileCheck,
  Calendar,
  Wallet,
  Globe
} from "lucide-react";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const PROFILE_STORAGE_KEY = "kisaan-sevak-schemes-profile";

const COPY = {
  en: {
    title: "Sarkar Saathi",
    subtitle: "Find verified government schemes for your farm",
    searchPlaceholder: "Search schemes by name or keyword...",
    chipsLabel: "Filter",
    allSchemes: "All Schemes",
    categories: {
      Subsidies: "Subsidies",
      Insurance: "Insurance",
      AgriTech: "Agri-Tech",
      Loans: "Loans",
      Markets: "Markets",
      Energy: "Energy",
      Soil: "Soil",
    },
    profileCardTitle: "Check your eligibility",
    profileCardSub: "Enter your land size and farm details to get matched.",
    startProfile: "Start eligibility check",
    editProfile: "Edit profile",
    profileSummary: "{crop} • {land} acres • {district}",
    profileUnknown: "Not set",
    formTitle: "Farming Profile",
    formSub: "Accurate matching based on your criteria.",
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
    eligibilityBasics: "Basics",
    ownLandQ: "Do you own farm land?",
    aadhaarQ: "Do you have Aadhaar?",
    bankQ: "Do you have bank account?",
    cropSownQ: "Crop sown this season?",
    govtEmployeeQ: "Govt employee?",
    incomeTaxQ: "Income tax payer?",
    institutionalQ: "Institutional farmer?",
    irrigationQ: "Want irrigation support?",
    solarPumpQ: "Need solar pump?",
    soilTestQ: "Want soil health test?",
    marketTradeQ: "Sell via e-NAM / APMC?",
    schemesTitle: "Matched schemes",
    schemesSub: "Official verified links",
    noResultsTitle: "No schemes found",
    noResultsBody: "Try a different keyword or check your profile details.",
    noResultsHint: "Tip: Complete your profile check for matching.",
    supportTag: "24/7 SUPPORT",
    supportTitle: "Application Guidance",
    supportSub: "Talk to a local Krishi Sahayak for step-by-step help.",
    callNow: "Call 9945443095",
    statuses: {
      eligible: "ELIGIBLE",
      check: "CHECK ELIGIBILITY",
    },
    actions: {
      applyNow: "Apply now",
      viewDetails: "View details",
      officialLink: "Official link",
      openOfficial: "Open official site",
    },
    fields: { 
        benefitAmount: "Benefit", 
        tenure: "Tenure",
        target: "Target Audience",
        funding: "Funding Type"
    },
  },
  hi: {
    title: "सरकार साथी", subtitle: "सरकारी योजनाओं की सही और सटीक जानकारी",
    searchPlaceholder: "योजना या कीवर्ड खोजें...", chipsLabel: "फ़िल्टर", allSchemes: "सभी योजनाएँ",
    categories: { Subsidies: "सब्सिडी", Insurance: "बीमा", AgriTech: "कृषि-तकनीक", Loans: "ऋण", Markets: "बाज़ार", Energy: "ऊर्जा", Soil: "मिट्टी" },
    profileCardTitle: "पात्रता जांचें", profileCardSub: "बेहतर मैच के लिए अपनी प्रोफ़ाइल भरें।",
    startProfile: "पात्रता जांच शुरू करें", editProfile: "प्रोफ़ाइल बदलें",
    profileSummary: "{crop} • {land} एकड़ • {district}", profileUnknown: "सेट नहीं",
    formTitle: "खेती प्रोफ़ाइल", formSub: "सही योजनाओं के लिए अपनी जानकारी भरें।",
    landSize: "भूमि (एकड़)", landPlaceholder: "जैसे 3.5", mainCrop: "मुख्य फसल",
    cropPlaceholder: "जैसे प्याज, कपास", district: "ज़िला", districtPlaceholder: "जैसे बेलगाम",
    state: "राज्य", statePlaceholder: "जैसे कर्नाटक", saveProfile: "सेव करें", clearProfile: "क्लियर",
    eligibilityBasics: "बेसिक जानकारी", ownLandQ: "क्या आपके पास ज़मीन है?", aadhaarQ: "क्या आपके पास आधार है?", bankQ: "क्या बैंक खाता है?",
    cropSownQ: "फसल बोई है?", govtEmployeeQ: "सरकारी कर्मचारी?", incomeTaxQ: "आयकरदाता?", institutionalQ: "संस्थागत किसान?",
    irrigationQ: "सिंचाई सहायता चाहिए?", solarPumpQ: "सोलर पंप चाहिए?", soilTestQ: "मिट्टी टेस्ट चाहिए?", marketTradeQ: "e-NAM पर बेचेंगे?",
    schemesTitle: "मिलती-जुलती योजनाएँ", schemesSub: "सत्यापित सरकारी लिंक",
    noResultsTitle: "कोई योजना नहीं मिली", noResultsBody: "कीवर्ड बदलें या प्रोफ़ाइल विवरण जांचें।",
    noResultsHint: "टिप: सही मैच के लिए अपनी प्रोफ़ाइल पूरी करें।",
    supportTag: "24/7 सहायता", supportTitle: "आवेदन सहायता", supportSub: "मदದ के लिए कृषि सहायक से बात करें।",
    callNow: "कॉल करें: 9945443095",
    statuses: { eligible: "पात्र", check: "पात्रता जांचें" },
    actions: { applyNow: "आवेदन करें", viewDetails: "विवरण", officialLink: "ऑफिशियल लिंक", openOfficial: "साइट खोलें" },
    fields: { benefitAmount: "लाभ", tenure: "अवधि", target: "लक्ष्य", funding: "वित्त पोषण" },
  },
  kn: {
    title: "ಸರ್ಕಾರ ಸಾಥಿ", subtitle: "ನಿಮಗಾಗಿ ಪರಿಶೀಲಿಸಿದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    searchPlaceholder: "ಯೋಜನೆಯ ಹೆಸರು ಅಥವಾ ಕೀವರ್ಡ್ ಹುಡುಕಿ...", chipsLabel: "ಫಿಲ್ಟರ್", allSchemes: "ಎಲ್ಲಾ ಯೋಜನೆಗಳು",
    categories: { Subsidies: "ಸೌಲಭ್ಯ", Insurance: "ವಿಮೆ", AgriTech: "ಕೃಷಿ-ಟೆಕ್", Loans: "ಸಾಲ", Markets: "ಮಾರುಕಟ್ಟೆ", Energy: "ಇಂಧನ", Soil: "ಮಣ್ಣು" },
    profileCardTitle: "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ", profileCardSub: "ಉತ್ತಮ ಹೊಂದಾಣಿಕೆಗಾಗಿ ನಿಮ್ಮ ವಿವರ ನಮೂದಿಸಿ.",
    startProfile: "ಅರ್ಹತೆ ಚೆಕ್ ಆರಂಭಿಸಿ", editProfile: "ಪ್ರೊಫೈಲ್ ಬದಲಿಸಿ",
    profileSummary: "{crop} • {land} ಎಕರೆ • {district}", profileUnknown: "ಸೆಟ್ ಆಗಿಲ್ಲ",
    formTitle: "ಕೃಷಿ ಪ್ರೊಫೈಲ್", formSub: "ನಿಮ್ಮ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ ಯೋಜನೆಗಳ ಹೊಂದಾಣಿಕೆ.",
    landSize: "ಜಮೀನು (ಎಕರೆ)", landPlaceholder: "ಉದಾ: 3.5", mainCrop: "ಮುಖ್ಯ ಬೆಳೆ", cropPlaceholder: "ಉದಾ: ಈರುಳ್ಳಿ",
    district: "ಜಿಲ್ಲೆ", districtPlaceholder: "ಉದಾ: ಬೆಳಗಾವಿ", state: "ರಾಜ್ಯ", statePlaceholder: "ಉದಾ: ಕರ್ನಾಟಕ",
    saveProfile: "ಸೇವ್ ಮಾಡಿ", clearProfile: "ಕ್ಲಿಯರ್",
    eligibilityBasics: "ಮೂಲ ವಿವರ", ownLandQ: "ಜಮೀನು ಹೊಂದಿದ್ದೀರಾ?", aadhaarQ: "ಆಧಾರ್ ಇದೆಯೇ?", bankQ: "ಬ್ಯಾಂಕ್ ಖಾತೆ ಇದೆಯೇ?", cropSownQ: "ಬೆಳೆ ಬಿತ್ತಿದ್ದೀರಾ?",
    govtEmployeeQ: "ಸರ್ಕಾರಿ ನೌಕರರಾ?", incomeTaxQ: "ತೆರಿಗೆ ಪಾವತಿದಾರರಾ?", institutionalQ: "ಸಂಸ್ಥಾತ್ಮಕ ರೈತರಾ?",
    irrigationQ: "ನೀರಾವರಿ ಸಹಾಯ ಬೇಕಾ?", solarPumpQ: "ಸೋಲಾರ್ ಪಂಪ್ ಬೇಕಾ?", soilTestQ: "ಮಣ್ಣು ಪರೀಕ್ಷೆ ಬೇಕಾ?", marketTradeQ: "e-NAM ನಲ್ಲಿ ಮಾರುವಿರಾ?",
    schemesTitle: "ಹೊಂದಾಣಿಕೆಯ ಯೋಜನೆಗಳು", schemesSub: "ಅಧಿಕೃತ ಪರಿಶೀಲಿಸಿದ ಲಿಂಕ್‌ಗಳು",
    noResultsTitle: "ಯೋಜನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ", noResultsBody: "ಬೇರೆ ಕೀವರ್ಡ್ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಪ್ರೊಫೈಲ್ ಪರಿಶೀಲಿಸಿ.",
    noResultsHint: "ಟಿಪ್ಪಣಿ: ನಿಖರ ಮ್ಯಾಚ್‌ಗಾಗಿ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ.",
    supportTag: "24/7 ಬೆಂಬಲ", supportTitle: "ಅರ್ಜಿಗೆ ಮಾರ್ಗದರ್ಶನ", supportSub: "ಸಹಾಯಕ್ಕಾಗಿ ಕೃಷಿ ಸಹಾಯಕನೊಂದಿಗೆ ಮಾತನಾಡಿ.",
    callNow: "ಕಾಲ್ ಮಾಡಿ: 9945443095",
    statuses: { eligible: "ಅರ್ಹ", check: "ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ" },
    actions: { applyNow: "ಈಗ ಅರ್ಜಿ", viewDetails: "ವಿವರಗಳು", officialLink: "ಅಧಿಕೃತ ಲಿಂಕ್", openOfficial: "ಸೈಟ್ ತೆರೆಯಿರಿ" },
    fields: { benefitAmount: "ಸೌಲಭ್ಯ", tenure: "ಅವಧಿ", target: "ಗುರಿ", funding: "ಧನಸಹಾಯ" },
  },
};

function formatCopy(template, vars) {
  if (typeof template !== "string" || !template) return "";
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = vars?.[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

function safeNumber(value) {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : null;
}

function getEligibilityTag(profile, schemeKey) {
  if (!profile) return "check";
  const landSize = safeNumber(profile?.landSize);
  const isInstitutional = Boolean(profile?.isInstitutional);
  const isGovtEmployee = Boolean(profile?.isGovtEmployee);
  const isIncomeTaxPayer = Boolean(profile?.isIncomeTaxPayer);
  const hasLand = profile?.hasLand === true || (landSize !== null && landSize > 0);
  const hasBankAccount = Boolean(profile?.hasBankAccount);
  const hasAadhaar = Boolean(profile?.hasAadhaar);
  const hasCropSown = Boolean(profile?.hasCropSown);

  if (schemeKey === "pmkisan" || schemeKey === "pmkmy") {
    if (!hasLand || isInstitutional || isGovtEmployee || isIncomeTaxPayer || !hasAadhaar || !hasBankAccount) return "check";
    return "eligible";
  }
  if (schemeKey === "pmfby") {
    if (!hasCropSown || !hasBankAccount) return "check";
    return "eligible";
  }
  if (schemeKey === "smam") {
    if (!hasLand || !hasAadhaar) return "check";
    return "eligible";
  }
  return "eligible";
}

export default function SarkarSaathiPage() {
  const { language } = useLanguage();
  const t = COPY[language] || COPY.en;

  const [activeCategory, setActiveCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [draft, setDraft] = useState(() => ({
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
    wantsIrrigation: profile?.wantsIrrigation ?? false,
    wantsSolarPump: profile?.wantsSolarPump ?? false,
    wantsSoilTest: profile?.wantsSoilTest ?? false,
    wantsMarketTrade: profile?.wantsMarketTrade ?? false,
  }));

  const [liveSchemes, setLiveSchemes] = useState([]);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const { data, error } = await supabase.from("government_schemes").select("*").eq("is_active", true);
        if (error) throw error;
        if (data && data.length > 0) {
          const mapped = data.map(s => ({
            key: s.key || s.id,
            category: s.category,
            icon: s.category === 'Insurance' ? ShieldCheck : s.category === 'Subsidies' ? Landmark : s.category === 'Energy' ? Sun : s.category === 'AgriTech' ? Tractor : Landmark,
            accent: s.category === 'Insurance' ? "from-slate-800 to-slate-700" : "from-emerald-700 to-emerald-600",
            title: { en: s.title_en, hi: s.title_hi || s.title_en, kn: s.title_kn || s.title_en },
            subTitle: { en: s.subtitle_en, hi: s.subtitle_hi || s.subtitle_en, kn: s.subtitle_kn || s.subtitle_en },
            officialSource: s.official_link?.replace('https://', '').split('/')[0],
            action: "openOfficial",
            link: s.official_link,
            extra: { benefit: s.benefit_en, target: s.target_en, funding: s.funding_en, tenure: s.tenure_en }
          }));
          setLiveSchemes(mapped);
        }
      } catch (err) {
        console.warn("Schemes repository offline.");
      }
    };
    fetchSchemes();
  }, []);

  const schemes = useMemo(() => {
    if (liveSchemes.length > 0) return liveSchemes;
    return [
      {
        key: "pmkisan", category: "Subsidies", icon: Landmark, accent: "from-emerald-700 to-emerald-600",
        title: { en: "PM-KISAN Samman Nidhi", hi: "पीएम-किसान सम्मान निधि", kn: "ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ" },
        subTitle: { en: "Income support of ₹6,000/year to all landholding farmer families.", hi: "सभी भूमिधारक किसान परिवारों को ₹6,000 प्रति वर्ष।", kn: "ಎಲ್ಲಾ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ವರ್ಷಕ್ಕೆ ₹6,000." },
        officialSource: "pmkisan.gov.in", action: "openOfficial", link: "https://pmkisan.gov.in/",
        extra: { benefit: "₹6,000 / Year", target: "Landholding Farmers", funding: "Direct Benefit Transfer", tenure: "Indefinite" }
      },
      {
        key: "pmkmy", category: "Subsidies", icon: HeartPulse, accent: "from-blue-700 to-indigo-600",
        title: { en: "PM Kisan Maandhan Yojana", hi: "पीएम किसान मानधन योजना", kn: "ಪಿಎಂ ಕಿಸಾನ್ ಮಾಂದನ್ ಯೋಜನೆ" },
        subTitle: { en: "Pension scheme for small and marginal farmers on attaining 60 years.", hi: "60 वर्ष की आयु प्राप्त करने पर पेंशन योजना।", kn: "60 ವರ್ಷ ತುಂಬಿದ ರೈತರಿಗೆ ಪಿಂಚಣಿ ಯೋಜನೆ." },
        officialSource: "pmkmy.gov.in", action: "openOfficial", link: "https://pmkmy.gov.in/",
        extra: { benefit: "₹3,000 / Month", target: "Small & Marginal Farmers", funding: "Contribution Based", tenure: "Post 60 Years" }
      },
      {
        key: "pmfby", category: "Insurance", icon: ShieldCheck, accent: "from-slate-800 to-slate-700",
        title: { en: "PM Fasal Bima Yojana", hi: "पीएम फसल बीमा योजना", kn: "ಪಿಎಂ ಫಸಲ್ ಬೀಮಾ ಯೋಜನೆ" },
        subTitle: { en: "Comprehensive crop insurance against non-preventable natural risks.", hi: "प्राकृतिक जोखिमों के विरुद्ध व्यापक फसल बीमा।", kn: "ನೈಸರ್ಗಿಕ ಅಪಾಯಗಳ ವಿರುದ್ಧ ವಿಮೆ." },
        officialSource: "pmfby.gov.in", action: "openOfficial", link: "https://pmfby.gov.in/",
        extra: { benefit: "Crop Damage Cover", target: "All Farmers", funding: "Insurance Model", tenure: "Seasonal" }
      },
      {
        key: "enam", category: "Markets", icon: Landmark, accent: "from-sky-700 to-blue-600",
        title: { en: "e-NAM (National Agri Market)", hi: "ई-नाम (राष्ट्रीय कृषि बाजार)", kn: "ಇ-ನಾಮ್ (ರಾಷ್ಟ್ರೀಯ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ)" },
        subTitle: { en: "Pan-India electronic trading portal which networks APMCs.", hi: "अखिल भारतीय इलेक्ट्रॉनिक ट्रेडिंग पोर्टल।", kn: "ಅಖಿಲ ಭಾರತ ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಟ್ರೇಡಿಂಗ್ ಪೋರ್ಟಲ್." },
        officialSource: "enam.gov.in", action: "openOfficial", link: "https://enam.gov.in/",
        extra: { benefit: "Direct Online Selling", target: "Producers & Traders", funding: "Market Ecosystem", tenure: "Lifetime" }
      },
      {
        key: "kusum", category: "Energy", icon: Sun, accent: "from-amber-600 to-orange-500",
        title: { en: "PM-KUSUM Solar Scheme", hi: "पीएम-कुसुम सोलर योजना", kn: "ಪಿಎಂ-ಕುಸುಮ್ ಸೋಲಾರ್ ಯೋಜನೆ" },
        subTitle: { en: "Installation of solar pumps and grid-connected solar power plants.", hi: "सोलर पंप और संयंत्रों की स्थापना।", kn: "ಸೋಲಾರ್ ಪಂಪ್‌ಗಳ ಅಳವಡಿಕೆ." },
        officialSource: "pmkusum.mnre.gov.in", action: "openOfficial", link: "https://pmkusum.mnre.gov.in/",
        extra: { benefit: "60-90% Subsidy", target: "Individual Farmers", funding: "Govt Subsidy", tenure: "Equipment Life" }
      },
      {
        key: "smam", category: "AgriTech", icon: Tractor, accent: "from-blue-700 to-indigo-700",
        title: { en: "SMAM Machinery Subsidy", hi: "एसएमएएम मशीनरी सब्सिडी", kn: "ಎಸ್‌ಎಂಎಎಂ ಯಂತ್ರೋಪಕರಣ ಸಬ್ಸಿಡಿ" },
        subTitle: { en: "Incentives for farm mechanization (Tractors, Tillers, etc).", hi: "कृषि मशीनीकरण के लिए प्रोत्साहन।", kn: "ಕೃಷಿ యಾಂತ್ರೀಕರಣಕ್ಕೆ ಪ್ರೋತ್ಸಾಹ." },
        officialSource: "agrimachinery.nic.in", action: "openOfficial", link: "https://agrimachinery.nic.in/",
        extra: { benefit: "40-80% Asset Subsidy", target: "Farmer Groups / Individuals", funding: "Capital Support", tenure: "One-time per asset" }
      }
    ];
  }, [liveSchemes]);

  const matched = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return schemes
      .filter((s) => {
        const catMatch = activeCategory === "ALL" ? true : s.category === activeCategory;
        if (!catMatch) return false;
        if (!q) return true;
        const title = (s.title[language] || s.title.en || "").toLowerCase();
        const sub = (s.subTitle[language] || s.subTitle.en || "").toLowerCase();
        return title.includes(q) || sub.includes(q);
      })
      .map((s) => ({ ...s, eligibilityTag: getEligibilityTag(profile, s.key) }))
      .filter((s) => !profile || s.eligibilityTag === "eligible");
  }, [activeCategory, language, profile, query, schemes]);

  const categories = [{ key: "ALL", label: t.allSchemes }, ...Object.entries(t.categories).map(([k, v]) => ({ key: k, label: v }))];

  return (
    <PageWrapper className="bg-[#F8FAFC]">
      <Header title={t.title} subtitle={t.subtitle} location={profile?.district} showBack maxWidth="max-w-[1400px]" />
      <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
        <div className="grid gap-10 xl:grid-cols-[1fr_400px]">
          <div className="space-y-10">
             <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
                <div className="relative">
                   <Search size={28} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" />
                   <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full h-20 bg-slate-50 border-none rounded-[2rem] pl-20 pr-10 text-base font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div className="mt-10 flex flex-wrap gap-3">
                   {categories.map(c => (
                      <button key={c.key} onClick={() => setActiveCategory(c.key)} className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeCategory === c.key ? 'bg-slate-950 text-white shadow-2xl -translate-y-1' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{c.label}</button>
                   ))}
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-2 gap-10">
                {matched.map(s => <SchemeCard key={s.key} scheme={s} language={language} t={t} onAction={() => window.open(s.link, '_blank')} />)}
                {matched.length === 0 && <div className="md:col-span-2 py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em]">{t.noResultsTitle}</div>}
             </div>
          </div>
          <div className="space-y-8">
             <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-5 group-hover:opacity-10 transition-opacity duration-500"><Activity size={320} /></div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase leading-none italic">{t.profileCardTitle}</h3>
                <p className="text-white/40 text-sm font-bold mb-12 leading-relaxed">{t.profileCardSub}</p>
                <div className="bg-white/5 rounded-3xl p-8 mb-10 border border-white/5 backdrop-blur-xl group-hover:bg-white/10 transition-all">
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-3">Institutional Profile</p>
                   <p className="text-lg font-black truncate text-white uppercase italic tracking-tighter">
                       {profile ? formatCopy(t.profileSummary, { crop: profile.crop || '---', land: profile.landSize || '---', district: profile.district || '---' }) : t.profileUnknown}
                   </p>
                </div>
                <button onClick={() => setProfileOpen(true)} className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-950/40 active:scale-95">
                    {profile ? t.editProfile : t.startProfile}
                </button>
             </div>
             <div className="bg-white rounded-[3rem] p-10 border border-slate-100 transition-all hover:shadow-2xl hover:shadow-emerald-900/5 group">
                <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 ring-1 ring-emerald-100"><Phone size={14} /> {t.supportTag}</span>
                <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter leading-none uppercase italic group-hover:text-emerald-700 transition-colors">{t.supportTitle}</h4>
                <p className="text-sm font-bold text-slate-400 mb-10 leading-relaxed">{t.supportSub}</p>
                <a href="tel:9945443095" className="flex items-center justify-center gap-4 w-full py-6 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase shadow-3xl shadow-slate-900/20 hover:bg-emerald-700 transition-all tracking-[0.2em] italic active:scale-95">{t.callNow}</a>
             </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
         {profileOpen && (
           <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-3xl">
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-3xl bg-white rounded-t-[3.5rem] md:rounded-[4.5rem] shadow-4xl flex flex-col max-h-[92vh] overflow-hidden border border-white/20">
                 <div className="flex items-center justify-between p-12 md:p-16 border-b border-slate-50 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-[2rem] bg-emerald-50 flex items-center justify-center text-emerald-600">
                             <FileCheck size={32} />
                        </div>
                        <div>
                           <h3 className="text-3xl font-black text-slate-950 tracking-tighter uppercase leading-none italic">{t.formTitle}</h3>
                           <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest mt-2">{t.formSub}</p>
                        </div>
                    </div>
                    <button onClick={() => setProfileOpen(false)} className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-950 hover:bg-slate-100 transition-all active:rotate-90 duration-300"><X size={32} /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-12 md:p-16 no-scrollbar space-y-14 pb-52 bg-slate-50/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Field label={t.landSize} value={draft.landSize} placeholder={t.landPlaceholder} type="number" onChange={v => setDraft(p => ({ ...p, landSize: v }))} icon={Scale} />
                       <Field label={t.mainCrop} value={draft.crop} placeholder={t.cropPlaceholder} onChange={v => setDraft(p => ({ ...p, crop: v }))} icon={Leaf} />
                       <Field label={t.district} value={draft.district} placeholder={t.districtPlaceholder} onChange={v => setDraft(p => ({ ...p, district: v }))} icon={MapPin} />
                       <Field label={t.state} value={draft.state} placeholder={t.statePlaceholder} onChange={v => setDraft(p => ({ ...p, state: v }))} icon={Globe} />
                    </div>
                    <div className="space-y-8">
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1 flex items-center gap-3">
                           <div className="h-1 w-8 bg-emerald-200 rounded-full" /> {t.eligibilityBasics}
                       </p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                 <div className="absolute bottom-0 left-0 w-full p-12 md:p-16 bg-white border-t border-slate-50 flex items-center justify-between gap-6 backdrop-blur-3xl bg-white/90">
                    <button onClick={() => { setProfile(null); window.localStorage.removeItem(PROFILE_STORAGE_KEY); setProfileOpen(false); }} className="flex-1 py-6 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all italic underline underline-offset-8 decoration-2 decoration-slate-200 hover:decoration-slate-900">
                        {t.clearProfile}
                    </button>
                    <button onClick={() => { setProfile({ ...draft }); window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ ...draft })); setProfileOpen(false); }} className="flex-[2] py-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-3xl shadow-emerald-950/20 italic active:scale-95">
                        {t.saveProfile}
                    </button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </PageWrapper>
  );
}

function Field({ label, value, placeholder, type="text", onChange, icon: Icon }) {
  return (
    <div className="space-y-3 group">
       <div className="flex items-center gap-2 pl-1">
           {Icon && <Icon size={14} className="text-emerald-500" />}
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{label}</p>
       </div>
       <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full h-16 bg-white rounded-2xl px-6 text-sm font-bold text-slate-950 border border-slate-100 group-hover:border-emerald-500/20 group-hover:shadow-lg transition-all outline-none" />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className={`flex items-center justify-between px-8 py-5 rounded-2xl border transition-all ${checked ? 'bg-emerald-50 border-emerald-100 text-emerald-900 shadow-xl shadow-emerald-900/5' : 'bg-white border-slate-50 text-slate-500 hover:bg-slate-50'}`}>
       <span className="text-[11px] font-black text-left leading-tight pr-6 uppercase tracking-tighter">{label}</span>
       <div className={`h-6 w-11 rounded-full relative transition-all shadow-inner ${checked ? 'bg-emerald-600' : 'bg-slate-100'}`}>
          <motion.div animate={{ right: checked ? 4 : 'auto', left: checked ? 'auto' : 4 }} className={`h-4 w-4 bg-white rounded-full absolute top-1 shadow-md`} />
       </div>
    </button>
  );
}

function SchemeCard({ scheme: s, language, t, onAction }) {
  const Icon = s.icon;
  const title = s.title[language] || s.title.en;
  const sub = s.subTitle[language] || s.subTitle.en;
  const status = s.eligibilityTag;

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 p-10 flex flex-col shadow-sm group hover:border-emerald-500/20 hover:shadow-4xl hover:shadow-emerald-950/5 transition-all relative overflow-hidden">
       <div className="flex justify-between items-start mb-10">
          <div className={`h-20 w-20 rounded-3xl bg-gradient-to-br ${s.accent} text-white flex items-center justify-center shadow-3xl shadow-black/10 transition-all group-hover:scale-110 group-hover:rotate-3`}><Icon size={38} strokeWidth={2.5} /></div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${status === 'eligible' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-slate-50 text-slate-400 ring-slate-100'}`}>{t.statuses[status]}</span>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{s.category}</span>
          </div>
       </div>
       
       <h4 className="text-2xl font-black text-slate-950 mb-3 leading-tight uppercase tracking-tighter italic group-hover:text-emerald-700 transition-colors pr-6">{title}</h4>
       <p className="text-sm font-bold text-slate-400 mb-10 leading-relaxed italic line-clamp-2">{sub}</p>
       
       <div className="grid grid-cols-2 gap-4 mb-10">
           <div className="bg-slate-50/50 rounded-2xl p-4 ring-1 ring-slate-100 group-hover:bg-white transition-all">
               <div className="flex items-center gap-2 mb-1.5">
                   <Wallet size={12} className="text-emerald-500" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.fields.benefitAmount}</p>
               </div>
               <p className="text-xs font-black text-slate-900 truncate">{s.extra.benefit}</p>
           </div>
           <div className="bg-slate-50/50 rounded-2xl p-4 ring-1 ring-slate-100 group-hover:bg-white transition-all">
               <div className="flex items-center gap-2 mb-1.5">
                   <HardHat size={12} className="text-blue-500" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.fields.target}</p>
               </div>
               <p className="text-xs font-black text-slate-900 truncate">{s.extra.target}</p>
           </div>
           <div className="bg-slate-50/50 rounded-2xl p-4 ring-1 ring-slate-100 group-hover:bg-white transition-all">
               <div className="flex items-center gap-2 mb-1.5">
                   <Activity size={12} className="text-orange-500" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.fields.funding}</p>
               </div>
               <p className="text-xs font-black text-slate-900 truncate">{s.extra.funding}</p>
           </div>
           <div className="bg-slate-50/50 rounded-2xl p-4 ring-1 ring-slate-100 group-hover:bg-white transition-all">
               <div className="flex items-center gap-2 mb-1.5">
                   <Calendar size={12} className="text-purple-500" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.fields.tenure}</p>
               </div>
               <p className="text-xs font-black text-slate-900 truncate">{s.extra.tenure}</p>
           </div>
       </div>

       <div className="mt-auto pt-10 border-t border-slate-50 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 min-w-0">
              <Globe size={14} className="text-slate-300 shrink-0" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] truncate">{s.officialSource}</p>
          </div>
          <button onClick={onAction} className="h-14 px-10 bg-slate-950 hover:bg-emerald-700 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest flex items-center gap-4 transition-all shadow-3xl shadow-slate-900/30 active:scale-95 italic">
             {t.actions.applyNow} <ArrowRight size={18} strokeWidth={3} />
          </button>
       </div>
    </div>
  );
}