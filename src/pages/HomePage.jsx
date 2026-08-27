import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Leaf, Store, Eye, EyeOff, ArrowRight, Globe,
  ShieldCheck, Users, Sprout, Tractor, CloudSun, MessageSquare,
  Check, ChevronDown, BadgeCheck, Wheat, BarChart3, Lock,
  TrendingUp, Zap, Star, ArrowDown, Sparkles, ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

/* ─── copy ───────────────────────────────────────────── */
const T = {
  en: {
    eyebrow: "India's farmer-first platform",
    h1a: "Where every", h1_accent: "harvest", h1b: "finds its worth.",
    sub: "Live mandi prices · AI advice · Government schemes · Waste auctions — all in your language.",
    cta: "Start farming smarter", cta2: "See how it works",
    about_h: "Built from the fields, for the fields.",
    about_p: "Kisaan Sevak was born from one simple truth — Indian farmers deserve real-time tools, not outdated guesswork. 12,000+ farmers across 9 states now price better, sell faster, and earn more.",
    feat_label: "What you get", feat_h: "Everything in one place.",
    f: [
      { h:"Live Mandi Rates",   b:"200+ mandis. Real-time. AI tells you exactly when to sell." },
      { h:"Waste → Wealth",     b:"Crop stubble, straw, stalks — turn what you burn into income." },
      { h:"Daily Brief",        b:"Morning weather, field tasks, crop calendar. Read out loud." },
      { h:"Govt Schemes",       b:"PM-KISAN, drip subsidy — find eligibility, apply in taps." },
      { h:"Kisaan Network",     b:"Pest alerts, water news, market tips with nearby farmers." },
      { h:"AI Crop Advisor",    b:"Disease, spray schedule, next crop. Hindi, Kannada, English." },
      { h:"Equipment Rental",   b:"Tractor, sprayer, harvester from a neighbour at fair rates." },
      { h:"Crop Insurance",     b:"Compare quotes, track claims. No paperwork maze." },
    ],
    stories_h: "Real farmers. Real rupees.",
    q: [
      { name:"Ravi Patil",   loc:"Wheat · Belgaum",   t:"Sold wheat straw for ₹18,000 I used to burn. That paid my son's school fees." },
      { name:"Anita Reddy",  loc:"Cotton · Solapur",  t:"Held 3 extra days on Mandi Mitra's signal. Got ₹200 more per quintal." },
      { name:"Suresh Kumar", loc:"Buyer · Bengaluru",  t:"Clean contracts, escrow payments, zero middlemen. First platform I fully trust." },
    ],
    stats: [{ n:"12,000+", l:"Farmers" },{ n:"₹4.2 Cr", l:"Auction volume" },{ n:"98%", l:"Payment success" },{ n:"9", l:"States" }],
    login_h: "Your farm awaits.", login_sub: "Free forever for farmers. No paperwork.",
    iam: "I am a",
    f_label:"Farmer", f_sub:"Grow & sell crops",
    b_label:"Buyer / Enterprise", b_sub:"Buy verified produce",
    buyer_note: "Buyer accounts are reviewed before marketplace access is granted.",
    tab_in:"Sign in", tab_up:"Sign up",
    fn:"Full name", fu:"Username", fp:"Password", fc:"Confirm password",
    pn:"Ravi Patil", pu:"ravi_patil", pp:"Min. 6 characters", pc:"Re-enter password",
    bi:"Sign in", bu:"Create account", bw:"Just a moment…",
    sw_up:"No account? Sign up free", sw_in:"Have an account? Sign in",
    pw_strength: ["Too short", "Weak", "Fair", "Good", "Strong"],
  },
  hi: {
    eyebrow: "भारत का किसान-पहले प्लेटफॉर्म",
    h1a: "जहाँ हर", h1_accent: "फसल", h1b: "को सही दाम मिलता है।",
    sub: "लाइव मंडी भाव · AI सलाह · सरकारी योजनाएँ · अवशेष नीलामी — आपकी भाषा में।",
    cta: "स्मार्ट खेती शुरू करें", cta2: "कैसे काम करता है",
    about_h: "खेतों से, खेतों के लिए बना।",
    about_p: "किसान सेवक एक सच से जन्मा — भारतीय किसानों को रियल-टाइम टूल चाहिए। 9 राज्यों के 12,000+ किसान अब बेहतर दाम पाते हैं।",
    feat_label: "क्या मिलता है", feat_h: "सब एक जगह।",
    f: [
      { h:"लाइव मंडी भाव",  b:"200+ मंडियाँ। रियल-टाइम। AI बताए कब बेचें।" },
      { h:"अवशेष → कमाई",  b:"पराली, पुआल, डंठल — जलाते थे वो अब बिकता है।" },
      { h:"रोज़ की ब्रीफ",  b:"सुबह का मौसम, खेत के काम — सुनाया जाए।" },
      { h:"सरकारी योजनाएँ", b:"पीएम-किसान, ड्रिप सब्सिडी — पात्रता जानें।" },
      { h:"किसान नेटवर्क",  b:"कीट चेतावनी, पानी की खबर नज़दीकी किसानों से।" },
      { h:"AI फसल सलाहकार", b:"बीमारी, छिड़काव, अगली फसल — हिंदी में।" },
      { h:"उपकरण किराया",   b:"ट्रैक्टर, स्प्रेयर — पारदर्शी दाम पर।" },
      { h:"फसल बीमा",       b:"कोटेशन तुलना, क्लेम ट्रैकिंग।" },
    ],
    stories_h: "असली किसान। असली कमाई।",
    q: [
      { name:"रवि पाटिल",   loc:"गेहूँ · बेलगाम",  t:"₹18,000 में पराली बेची जो जलाता था। बेटे की फीस उससे भरी।" },
      { name:"अनिता रेड्डी", loc:"कपास · सोलापुर", t:"3 दिन रुकी। क्विंटल पर ₹200 ज़्यादा मिले।" },
      { name:"सुरेश कुमार",  loc:"खरीदार · बेंगलुरु",t:"साफ़ कॉन्ट्रैक्ट, एस्क्रो भुगतान, कोई बिचौलिया नहीं।" },
    ],
    stats:[{n:"12,000+",l:"किसान"},{n:"₹4.2 Cr",l:"नीलामी"},{n:"98%",l:"भुगतान"},{n:"9",l:"राज्य"}],
    login_h:"आपका खेत इंतज़ार कर रहा है।", login_sub:"किसानों के लिए हमेशा मुफ़्त।",
    iam:"मैं हूँ", f_label:"किसान", f_sub:"फसल उगाएँ और बेचें",
    b_label:"खरीदार / एंटरप्राइज़", b_sub:"सत्यापित उपज खरीदें",
    buyer_note:"बाज़ार पहुँच से पहले खरीदार खाते की समीक्षा होती है।",
    tab_in:"साइन इन", tab_up:"साइन अप",
    fn:"पूरा नाम", fu:"यूज़रनेम", fp:"पासवर्ड", fc:"पासवर्ड दोबारा",
    pn:"रवि पाटिल", pu:"ravi_patil", pp:"कम से कम 6 अक्षर", pc:"पासवर्ड फिर लिखें",
    bi:"साइन इन करें", bu:"खाता बनाएँ", bw:"प्रतीक्षा करें…",
    sw_up:"नए हैं? साइन अप करें", sw_in:"खाता है? साइन इन करें",
    pw_strength:["बहुत छोटा","कमज़ोर","ठीक है","अच्छा","मज़बूत"],
  },
  kn: {
    eyebrow: "ಭಾರತದ ರೈತ-ಮೊದಲ ವೇದಿಕೆ",
    h1a: "ಪ್ರತಿ", h1_accent: "ಕೊಯ್ಲು", h1b: "ತನ್ನ ಮೌಲ್ಯ ಕಂಡುಕೊಳ್ಳುತ್ತದೆ.",
    sub: "ಲೈವ್ ಮಂಡಿ ಬೆಲೆ · AI ಸಲಹೆ · ಸರ್ಕಾರಿ ಯೋಜನೆ · ಅವಶೇಷ ಹರಾಜು — ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ.",
    cta: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಆರಂಭಿಸಿ", cta2: "ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
    about_h: "ಹೊಲದಿಂದ, ಹೊಲಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.",
    about_p: "ಕಿಸಾನ್ ಸೇವಕ್ ಒಂದು ಸತ್ಯದಿಂದ ಜನಿಸಿತು. 9 ರಾಜ್ಯಗಳ 12,000+ ರೈತರು ಉತ್ತಮ ಬೆಲೆ ಪಡೆಯುತ್ತಿದ್ದಾರೆ.",
    feat_label: "ಏನು ಸಿಗುತ್ತದೆ", feat_h: "ಎಲ್ಲವೂ ಒಂದೇ ಜಾಗದಲ್ಲಿ.",
    f: [
      { h:"ಲೈವ್ ಮಂಡಿ ಬೆಲೆ",  b:"200+ ಮಂಡಿ. ರಿಯಲ್-ಟೈಮ್. AI ಯಾವಾಗ ಮಾರಬೇಕೆಂದು ಹೇಳುತ್ತದೆ." },
      { h:"ಅವಶೇಷ → ಆದಾಯ",    b:"ಹೊಲ್ಲು, ಕಡ್ಡಿ — ಸುಡುತ್ತಿದ್ದದ್ದರಿಂದ ಹಣ ಗಳಿಸಿ." },
      { h:"ದೈನಂದಿನ ಬ್ರೀಫ್",   b:"ಬೆಳಗಿನ ಹವಾಮಾನ, ಕೆಲಸ — ಓದಿ ಹೇಳಲಾಗುತ್ತದೆ." },
      { h:"ಸರ್ಕಾರಿ ಯೋಜನೆ",    b:"ಪಿಎಂ-ಕಿಸಾನ್, ಡ್ರಿಪ್ ಸಬ್ಸಿಡಿ — ಅರ್ಜಿ ಸಲ್ಲಿಸಿ." },
      { h:"ಕಿಸಾನ್ ನೆಟ್ವರ್ಕ್",  b:"ಕೀಟ ಎಚ್ಚರಿಕೆ, ನೀರಿನ ಸುದ್ದಿ ಹಂಚಿಕೊಳ್ಳಿ." },
      { h:"AI ಬೆಳೆ ಸಲಹೆ",     b:"ರೋಗ, ಸಿಂಪಡಣೆ — ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರ." },
      { h:"ಉಪಕರಣ ಬಾಡಿಗೆ",      b:"ಟ್ರ್ಯಾಕ್ಟರ್ — ಸಮೀಪದ ರೈತರಿಂದ ಪಾರದರ್ಶಕ ದರದಲ್ಲಿ." },
      { h:"ಬೆಳೆ ವಿಮೆ",         b:"ಉದ್ಧರಣ ಹೋಲಿಸಿ, ದಾವೆ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ." },
    ],
    stories_h: "ನಿಜ ರೈತರು. ನಿಜ ಹಣ.",
    q: [
      { name:"ರವಿ ಪಾಟೀಲ್",    loc:"ಗೋಧಿ · ಬೆಳಗಾವಿ",    t:"₹18,000ಕ್ಕೆ ಹೊಲ್ಲು ಮಾರಿದೆ. ಮಗನ ಶಾಲೆ ಶುಲ್ಕ ಕಟ್ಟಿದೆ." },
      { name:"ಅನಿತಾ ರೆಡ್ಡಿ",   loc:"ಹತ್ತಿ · ಸೋಲಾಪುರ",   t:"3 ದಿನ ಕಾದೆ. ಕ್ವಿಂಟಲ್‌ಗೆ ₹200 ಹೆಚ್ಚು ಸಿಕ್ಕಿತು." },
      { name:"ಸುರೇಶ್ ಕುಮಾರ್",  loc:"ಖರೀದಿದಾರ · ಬೆಂಗಳೂರು", t:"ಸ್ಪಷ್ಟ ಒಪ್ಪಂದ, ಎಸ್ಕ್ರೋ, ಮಧ್ಯವರ್ತಿ ಇಲ್ಲ." },
    ],
    stats:[{n:"12,000+",l:"ರೈತರು"},{n:"₹4.2 Cr",l:"ಹರಾಜು"},{n:"98%",l:"ಪಾವತಿ"},{n:"9",l:"ರಾಜ್ಯ"}],
    login_h:"ನಿಮ್ಮ ಹೊಲ ಕಾಯುತ್ತಿದೆ.", login_sub:"ರೈತರಿಗೆ ಯಾವಾಗಲೂ ಉಚಿತ.",
    iam:"ನಾನು", f_label:"ರೈತ", f_sub:"ಬೆಳೆ ಬೆಳೆಸಿ ಮಾರಿ",
    b_label:"ಖರೀದಿದಾರ / ಎಂಟರ್ಪ್ರೈಸ್", b_sub:"ಪರಿಶೀಲಿತ ಉತ್ಪನ್ನ ಖರೀದಿಸಿ",
    buyer_note:"ಮಾರುಕಟ್ಟೆ ಪ್ರವೇಶ ಮಂಜೂರಾಗುವ ಮೊದಲು ತಂಡ ಖಾತೆ ಪರಿಶೀಲಿಸುತ್ತದೆ.",
    tab_in:"ಸೈನ್ ಇನ್", tab_up:"ಸೈನ್ ಅಪ್",
    fn:"ಪೂರ್ಣ ಹೆಸರು", fu:"ಯೂಸರ್‌ನೇಮ್", fp:"ಪಾಸ್‌ವರ್ಡ್", fc:"ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
    pn:"ರವಿ ಪಾಟೀಲ್", pu:"ravi_patil", pp:"ಕನಿಷ್ಠ 6 ಅಕ್ಷರ", pc:"ಮತ್ತೆ ಟೈಪ್ ಮಾಡಿ",
    bi:"ಸೈನ್ ಇನ್ ಮಾಡಿ", bu:"ಖಾತೆ ತೆರೆಯಿರಿ", bw:"ನಿರೀಕ್ಷಿಸಿ…",
    sw_up:"ಹೊಸಬರೇ? ಸೈನ್ ಅಪ್ ಮಾಡಿ", sw_in:"ಖಾತೆ ಇದೆಯೇ? ಸೈನ್ ಇನ್ ಮಾಡಿ",
    pw_strength:["ತುಂಬ ಚಿಕ್ಕ","ದುರ್ಬಲ","ಸರಿ","ಒಳ್ಳೆಯದು","ಬಲಿಷ್ಠ"],
  },
};

const LANGS = [{ code:"en", native:"EN" }, { code:"hi", native:"हि" }, { code:"kn", native:"ಕ" }];
const FEAT_ICONS  = [BarChart3, Wheat, CloudSun, ShieldCheck, Users, MessageSquare, Tractor, BadgeCheck];
const FEAT_COLORS = ["#22c55e","#eab308","#38bdf8","#a78bfa","#34d399","#fb923c","#f472b6","#6ee7b7"];
const FEAT_BG     = ["#052e16","#422006","#082f49","#2e1065","#064e3b","#431407","#500724","#064e3b"];

function redir(p) { return p === "buyer" || p === "enterprise" ? "/buyer-portal" : p === "admin" ? "/admin" : "/farmer-dashboard"; }
function norm(v)  { return v === "enterprise" ? "buyer" : v; }
function hasVal(v){ return Boolean(String(v || "").trim()); }

/* password strength: 0-4 */
function pwStrength(pw) {
  if (!pw || pw.length < 6) return 0;
  let score = 1;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_COLOR = ["#ef4444","#f97316","#eab308","#22c55e","#16a34a"];

/* Grain texture */
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ─── Main ──────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const { loading, isAuthenticated, portal, signIn, signUp } = useAuth();
  const { language, setLanguage } = useLanguage();
  const heroRef  = useRef(null);
  const loginRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start","end start"] });
  const heroY = useTransform(scrollYProgress, [0,1], ["0%","30%"]);
  const heroO = useTransform(scrollYProgress, [0,0.8], [1, 0]);

  const [uiLang,   setUiLang]   = useState(language || "en");
  const [mode,     setMode]     = useState("signin");
  const [selP,     setSelP]     = useState("farmer");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const t    = T[uiLang] || T.en;
  const isUp = mode === "signup";
  const cp   = useMemo(() => norm(selP), [selP]);
  const pwStr = useMemo(() => pwStrength(password), [password]);

  const canSubmit = useMemo(() => {
    if (isUp) return hasVal(username) && hasVal(fullName) && password.length >= 6 && password === confirm;
    return hasVal(username) && hasVal(password);
  }, [isUp, username, fullName, password, confirm]);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate(redir(portal), { replace: true });
  }, [isAuthenticated, loading, navigate, portal]);

  const swLang = useCallback((c) => { setUiLang(c); setLanguage(c); }, [setLanguage]);
  const reset  = () => { setError(""); setSuccess(""); };

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true); reset();
    try {
      if (isUp) {
        await signUp({ username: username.trim(), password, name: fullName.trim(), role: cp });
        setSuccess("✓ Account created! Welcome aboard.");
      } else {
        await signIn({ username: username.trim(), password, role: cp });
        setSuccess("✓ Welcome back!");
      }
      setTimeout(() => navigate(redir(cp), { replace: true }), 400);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0a0f07", flexDirection:"column", gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:"50%", border:"3px solid #1a3a10", borderTopColor:"#4ade80", animation:"spin 0.8s linear infinite" }}/>
      <span style={{ color:"rgba(255,255,255,0.3)", fontSize:13, fontWeight:600, letterSpacing:"0.06em" }}>LOADING</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (isAuthenticated) return <Navigate to={redir(portal)} replace />;

  return (
    <div style={{ fontFamily:"'Manrope','Sora',sans-serif", background:"#faf7f2", color:"#1a1a1a", overflowX:"hidden" }}>

    {/* ── NAV ─────────────────────────────────────────────── */}
    <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(10,15,7,0.94)", backdropFilter:"blur(24px)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"default" }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#16a34a,#84cc16)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(22,163,74,0.4)" }}>
            <Sprout size={18} color="#fff"/>
          </div>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:16, color:"#fff", letterSpacing:"-0.02em", lineHeight:1 }}>Kisaan Sevak</div>
            <div style={{ fontSize:9, fontWeight:700, color:"#84cc16", letterSpacing:"0.18em", textTransform:"uppercase" }}>Farmer First</div>
          </div>
        </div>

        {/* Centre links */}
        <nav style={{ display:"flex", gap:28, alignItems:"center" }} className="hidden md:flex">
          {[["#about","About"],["#features","Features"],["#stories","Stories"],["#login","Sign In"]].map(([h,l]) => (
            <a key={h} href={h} style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.45)", textDecoration:"none", transition:"color .15s", letterSpacing:"0.01em" }}
              onMouseEnter={e=>e.target.style.color="#84cc16"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.45)"}>{l}</a>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ display:"flex", gap:3, padding:"3px", borderRadius:10, background:"rgba(255,255,255,0.05)" }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => swLang(l.code)}
                style={{ padding:"5px 11px", borderRadius:8, fontSize:11, fontWeight:800, border:"none", cursor:"pointer", transition:"all .15s",
                  background: uiLang===l.code ? "#16a34a" : "transparent",
                  color: uiLang===l.code ? "#fff" : "rgba(255,255,255,0.35)" }}>
                {l.native}
              </button>
            ))}
          </div>
          <motion.button onClick={() => loginRef.current?.scrollIntoView({ behavior:"smooth" })}
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            style={{ padding:"9px 20px", borderRadius:12, fontSize:13, fontWeight:800, border:"none", cursor:"pointer",
              background:"linear-gradient(135deg,#16a34a,#15803d)", color:"#fff",
              boxShadow:"0 4px 14px rgba(22,163,74,0.4)" }}>
            Get started
          </motion.button>
        </div>
      </div>
    </header>

    {/* ── HERO ─────────────────────────────────────────────── */}
    <section ref={heroRef} style={{ position:"relative", minHeight:"100vh", overflow:"hidden",
      background:"linear-gradient(160deg,#050d03 0%,#0a1f07 40%,#0d2a09 100%)",
      display:"flex", flexDirection:"column", justifyContent:"center", paddingBottom:120 }}>

      {/* Parallax decorations */}
      <motion.div style={{ position:"absolute", inset:0, y:heroY }} aria-hidden>
        <div style={{ position:"absolute", top:"10%", left:"3%", width:800, height:800, borderRadius:"50%",
          background:"radial-gradient(ellipse,rgba(22,163,74,0.2) 0%,transparent 60%)" }}/>
        <div style={{ position:"absolute", top:"-8%", right:"8%", width:450, height:450, borderRadius:"50%",
          background:"radial-gradient(ellipse,rgba(132,204,22,0.1) 0%,transparent 65%)" }}/>
        <div style={{ position:"absolute", bottom:"5%", right:"20%", width:300, height:300, borderRadius:"50%",
          background:"radial-gradient(ellipse,rgba(74,222,128,0.08) 0%,transparent 70%)" }}/>
        <div style={{ position:"absolute", inset:0, backgroundImage:GRAIN, opacity:0.5 }}/>
        {/* Grid */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.03 }} xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M64 0L0 0 0 64" fill="none" stroke="#4ade80" strokeWidth="0.5"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </motion.div>

      {/* Floating icons */}
      {[
        { Icon:Wheat,    x:"80%", y:"16%", s:32, rot:15,  op:0.13 },
        { Icon:Sprout,   x:"88%", y:"52%", s:24, rot:-10, op:0.10 },
        { Icon:Leaf,     x:"75%", y:"78%", s:22, rot:25,  op:0.09 },
        { Icon:CloudSun, x:"4%",  y:"70%", s:26, rot:0,   op:0.08 },
        { Icon:Tractor,  x:"91%", y:"28%", s:22, rot:5,   op:0.09 },
        { Icon:Sparkles, x:"55%", y:"8%",  s:18, rot:-5,  op:0.07 },
      ].map(({ Icon, x, y, s, rot, op }, i) => (
        <motion.div key={i} aria-hidden
          initial={{ opacity:0, scale:0.4 }} animate={{ opacity:op, scale:1 }}
          transition={{ delay:0.3+i*0.12, duration:1.4, ease:"easeOut" }}
          style={{ position:"absolute", left:x, top:y, color:"#84cc16", transform:`rotate(${rot}deg)` }}>
          <Icon size={s}/>
        </motion.div>
      ))}

      {/* Hero content */}
      <motion.div style={{ position:"relative", zIndex:10, maxWidth:1280, margin:"0 auto",
        padding:"100px 24px 0", width:"100%", opacity:heroO }}>
        <AnimatePresence mode="wait">
          <motion.div key={`hero-${uiLang}`}
            initial={{ opacity:0, y:36 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
            transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}>

            {/* Eyebrow badge */}
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.15 }}
              style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:28,
                padding:"7px 18px", borderRadius:999,
                border:"1px solid rgba(132,204,22,0.3)", background:"rgba(132,204,22,0.06)" }}>
              <Zap size={12} color="#84cc16"/>
              <span style={{ fontSize:12, fontWeight:700, color:"#84cc16", letterSpacing:"0.06em" }}>{t.eyebrow}</span>
            </motion.div>

            {/* Giant headline */}
            <h1 style={{ margin:0, lineHeight:1.0, letterSpacing:"-0.04em", fontFamily:"'Sora',sans-serif",
              fontWeight:900, fontSize:"clamp(3rem,8vw,7rem)", color:"#fff", maxWidth:900 }}>
              {t.h1a}{" "}
              <span style={{ display:"inline-block", position:"relative" }}>
                <span style={{ background:"linear-gradient(120deg,#4ade80,#84cc16,#a3e635)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  {t.h1_accent}
                </span>
                <svg style={{ position:"absolute", bottom:-10, left:0, width:"100%" }} viewBox="0 0 200 14" fill="none">
                  <path d="M2 9 Q50 3 100 9 Q150 15 198 7" stroke="#84cc16" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
                </svg>
              </span>{" "}
              <span style={{ color:"rgba(255,255,255,0.85)" }}>{t.h1b}</span>
            </h1>

            <p style={{ marginTop:32, fontSize:17, lineHeight:1.7, color:"rgba(255,255,255,0.45)", maxWidth:530, fontWeight:400 }}>
              {t.sub}
            </p>

            {/* CTAs */}
            <div style={{ marginTop:44, display:"flex", flexWrap:"wrap", gap:14, alignItems:"center" }}>
              <motion.button onClick={() => loginRef.current?.scrollIntoView({ behavior:"smooth" })}
                whileHover={{ scale:1.04, boxShadow:"0 12px 40px rgba(22,163,74,0.55)" }}
                whileTap={{ scale:0.97 }}
                style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"15px 32px",
                  borderRadius:16, fontSize:15, fontWeight:800, border:"none", cursor:"pointer",
                  background:"linear-gradient(135deg,#16a34a,#15803d)", color:"#fff",
                  boxShadow:"0 8px 32px rgba(22,163,74,0.45)" }}>
                {t.cta} <ArrowRight size={17}/>
              </motion.button>
              <a href="#features"
                style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:14, fontWeight:700,
                  color:"rgba(255,255,255,0.35)", textDecoration:"none", transition:"color .15s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.35)"}>
                {t.cta2} <ChevronRight size={15}/>
              </a>
            </div>

            {/* Stats row under hero CTA */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5, duration:0.7 }}
              style={{ marginTop:60, display:"flex", flexWrap:"wrap", gap:0,
                borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:32 }}>
              {t.stats.map((s, i) => (
                <div key={i} style={{ padding:"0 32px 0 0", marginRight:32, borderRight: i < t.stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                  <div style={{ fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:900, fontFamily:"'Sora',sans-serif",
                    background:"linear-gradient(120deg,#4ade80,#84cc16)", WebkitBackgroundClip:"text",
                    WebkitTextFillColor:"transparent", backgroundClip:"text", lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.35)", marginTop:4, letterSpacing:"0.04em" }}>{s.l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div animate={{ y:[0,8,0] }} transition={{ repeat:Infinity, duration:2 }}
        style={{ position:"absolute", bottom:48, left:"50%", transform:"translateX(-50%)", cursor:"pointer", zIndex:10 }}
        onClick={() => document.getElementById("about")?.scrollIntoView({ behavior:"smooth" })}>
        <ArrowDown size={20} color="rgba(132,204,22,0.5)"/>
      </motion.div>

      {/* Bottom wave */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, lineHeight:0 }} aria-hidden>
        <svg viewBox="0 0 1440 120" style={{ width:"100%", display:"block" }}>
          <path d="M0 120 L0 80 Q240 10 480 55 Q720 100 960 40 Q1200 0 1440 60 L1440 120 Z" fill="#faf7f2"/>
        </svg>
      </div>
    </section>

    {/* ── ABOUT ─────────────────────────────────────────────── */}
    <section id="about" style={{ background:"#faf7f2", padding:"120px 24px" }}>
      <div style={{ maxWidth:1280, margin:"0 auto", display:"grid", gap:80, alignItems:"center",
        gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))" }}>

        <AnimatePresence mode="wait">
          <motion.div key={`ab-${uiLang}`} initial={{ opacity:0, x:-28 }} whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }} transition={{ duration:0.7 }}>
            <div style={{ fontSize:"clamp(5rem,12vw,10rem)", fontWeight:900, fontFamily:"'Sora',sans-serif",
              lineHeight:0.85, letterSpacing:"-0.06em", userSelect:"none",
              background:"linear-gradient(135deg,#d1fae5,#a7f3d0)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:28 }}>
              KS
            </div>
            <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:900, fontFamily:"'Sora',sans-serif",
              lineHeight:1.2, letterSpacing:"-0.03em", color:"#0a0f07", margin:"0 0 20px" }}>
              {t.about_h}
            </h2>
            <p style={{ fontSize:16, lineHeight:1.85, color:"#4a5040", maxWidth:440, margin:"0 0 36px" }}>
              {t.about_p}
            </p>
            <motion.button onClick={() => loginRef.current?.scrollIntoView({ behavior:"smooth" })}
              whileHover={{ background:"#16a34a", color:"#fff" }}
              style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"13px 28px",
                borderRadius:14, fontSize:14, fontWeight:800, border:"2px solid #16a34a",
                background:"transparent", color:"#16a34a", cursor:"pointer", transition:"all .2s" }}>
              Get started free <ArrowRight size={15}/>
            </motion.button>
          </motion.div>
        </AnimatePresence>

        {/* Stats mosaic */}
        <motion.div initial={{ opacity:0, x:28 }} whileInView={{ opacity:1, x:0 }}
          viewport={{ once:true }} transition={{ duration:0.7, delay:0.1 }}
          style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {[
            { bg:"#052e16", c:"#4ade80", label:"12,000+", sub:"Farmers nationwide", Icon:Users },
            { bg:"#422006", c:"#fbbf24", label:"₹4.2 Cr", sub:"Auction volume", Icon:BarChart3 },
            { bg:"#082f49", c:"#38bdf8", label:"98%",     sub:"Payment success", Icon:BadgeCheck },
            { bg:"#2e1065", c:"#a78bfa", label:"9 States", sub:"Coverage & growing", Icon:Sprout },
          ].map((card, i) => (
            <motion.div key={i} whileHover={{ y:-5, scale:1.025 }} transition={{ duration:0.2 }}
              style={{ borderRadius:22, padding:"28px 22px", background:card.bg,
                border:"1px solid rgba(255,255,255,0.07)", position:"relative", overflow:"hidden",
                boxShadow:"0 4px 24px rgba(0,0,0,0.3)" }}>
              <card.Icon size={20} color={card.c} style={{ marginBottom:16, opacity:0.7 }}/>
              <div style={{ fontSize:"1.9rem", fontWeight:900, fontFamily:"'Sora',sans-serif", color:card.c, lineHeight:1 }}>{card.label}</div>
              <div style={{ marginTop:6, fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.38)", letterSpacing:"0.04em" }}>{card.sub}</div>
              <div style={{ position:"absolute", bottom:-24, right:-24, width:90, height:90,
                borderRadius:"50%", background:card.c, opacity:0.08, filter:"blur(24px)" }}/>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ── FEATURES ─────────────────────────────────────────── */}
    <section id="features" style={{ background:"#0a0f07", padding:"100px 24px" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <AnimatePresence mode="wait">
          <motion.div key={`fh-${uiLang}`} initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} style={{ marginBottom:56, maxWidth:620 }}>
            <span style={{ display:"inline-block", marginBottom:12, padding:"5px 14px",
              borderRadius:999, fontSize:11, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase",
              background:"rgba(74,222,128,0.08)", color:"#4ade80", border:"1px solid rgba(74,222,128,0.18)" }}>
              {t.feat_label}
            </span>
            <h2 style={{ margin:0, fontSize:"clamp(2rem,4vw,3rem)", fontWeight:900,
              fontFamily:"'Sora',sans-serif", letterSpacing:"-0.04em", color:"#fff", lineHeight:1.1 }}>
              {t.feat_h}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Bento grid */}
        <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(4,1fr)" }}>
          {t.f.map((f, i) => {
            const Icon = FEAT_ICONS[i];
            const color = FEAT_COLORS[i];
            const bg = FEAT_BG[i];
            const wide = i === 0;
            return (
              <motion.div key={`${uiLang}-f-${i}`}
                initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.06, duration:0.5 }}
                whileHover={{ y:-4, scale:1.015 }}
                style={{ gridColumn: wide ? "span 2" : "span 1", borderRadius:22,
                  padding: wide ? "32px 28px" : "24px 20px", background:bg,
                  border:"1px solid rgba(255,255,255,0.06)", position:"relative", overflow:"hidden", cursor:"default" }}>
                <div style={{ position:"absolute", top:-28, right:-28, width:100, height:100,
                  borderRadius:"50%", background:color, opacity:0.07, filter:"blur(28px)" }}/>
                <div style={{ position:"relative", zIndex:1 }}>
                  <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
                    width:44, height:44, borderRadius:14, marginBottom:16,
                    background:`${color}18`, border:`1px solid ${color}28` }}>
                    <Icon size={20} color={color}/>
                  </div>
                  <div style={{ fontSize: wide ? 17 : 14, fontWeight:800, color:"#fff", marginBottom:8,
                    fontFamily:"'Sora',sans-serif", letterSpacing:"-0.02em" }}>{f.h}</div>
                  <div style={{ fontSize:13, lineHeight:1.65, color:"rgba(255,255,255,0.42)" }}>{f.b}</div>
                </div>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2,
                  background:`linear-gradient(90deg,${color},transparent)`, opacity:0.45 }}/>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    {/* ── STORIES ───────────────────────────────────────────── */}
    <section id="stories" style={{ background:"#faf7f2", padding:"100px 24px", overflow:"hidden" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <AnimatePresence mode="wait">
          <motion.div key={`sh-${uiLang}`} initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
            style={{ marginBottom:56, display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:20 }}>
            <div>
              <span style={{ display:"inline-block", marginBottom:12, padding:"5px 14px", borderRadius:999,
                fontSize:11, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase",
                background:"rgba(22,163,74,0.08)", color:"#16a34a", border:"1px solid rgba(22,163,74,0.18)" }}>
                Testimonials
              </span>
              <h2 style={{ margin:0, fontSize:"clamp(2rem,4vw,3rem)", fontWeight:900,
                fontFamily:"'Sora',sans-serif", letterSpacing:"-0.04em", color:"#0a0f07", lineHeight:1.1 }}>
                {t.stories_h}
              </h2>
            </div>
            <motion.button onClick={() => loginRef.current?.scrollIntoView({ behavior:"smooth" })}
              whileHover={{ color:"#0a0f07" }}
              style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:13, fontWeight:700,
                color:"#16a34a", background:"none", border:"none", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:4 }}>
              Join them <ArrowRight size={14}/>
            </motion.button>
          </motion.div>
        </AnimatePresence>

        <div style={{ display:"grid", gap:20, gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))" }}>
          {t.q.map((q, i) => (
            <motion.div key={`${uiLang}-q-${i}`}
              initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.12, duration:0.55 }}
              whileHover={{ y:-4 }}
              style={{ borderRadius:24, padding:"32px 28px", position:"relative", overflow:"hidden",
                background: i===1 ? "#0a0f07" : "#fff",
                border: i===1 ? "1px solid rgba(74,222,128,0.2)" : "1px solid #e8e3da",
                boxShadow:"0 8px 40px rgba(0,0,0,0.07)" }}>

              {/* Stars */}
              <div style={{ display:"flex", gap:3, marginBottom:20 }}>
                {[0,1,2,3,4].map(j => <Star key={j} size={13} fill="#f59e0b" color="#f59e0b"/>)}
              </div>

              <p style={{ fontSize:15, lineHeight:1.8, margin:"0 0 28px",
                color: i===1 ? "rgba(255,255,255,0.75)" : "#3a3a3a", fontStyle:"italic" }}>
                "{q.t}"
              </p>

              <div style={{ display:"flex", alignItems:"center", gap:12,
                paddingTop:20, borderTop:`1px solid ${i===1?"rgba(255,255,255,0.08)":"#f0ece4"}` }}>
                <div style={{ width:40, height:40, borderRadius:"50%", display:"flex", alignItems:"center",
                  justifyContent:"center", fontWeight:900, fontSize:16, color:"#fff", flexShrink:0,
                  background:"linear-gradient(135deg,#16a34a,#4d7c0f)" }}>
                  {q.name[0]}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:800, color: i===1?"#fff":"#0a0f07" }}>{q.name}</div>
                  <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.04em", marginTop:2,
                    color: i===1?"rgba(74,222,128,0.7)":"#9a8f80" }}>{q.loc}</div>
                </div>
                {i===1 && (
                  <div style={{ marginLeft:"auto", padding:"4px 10px", borderRadius:999,
                    background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.2)" }}>
                    <BadgeCheck size={14} color="#4ade80"/>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── LOGIN — full-bleed split ───────────────────────────── */}
    <section ref={loginRef} id="login"
      style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr" }}
      className="login-section">

      {/* Left — dark brand */}
      <div style={{ position:"relative", overflow:"hidden", padding:"80px 64px",
        background:"linear-gradient(160deg,#050d03 0%,#0a1f07 50%,#0d2a09 100%)",
        display:"flex", flexDirection:"column", justifyContent:"center" }}
        className="login-left">
        <div style={{ position:"absolute", top:"18%", left:"-12%", width:520, height:520, borderRadius:"50%",
          background:"radial-gradient(ellipse,rgba(22,163,74,0.18) 0%,transparent 70%)" }} aria-hidden/>
        <div style={{ position:"absolute", inset:0, backgroundImage:GRAIN, opacity:0.4 }} aria-hidden/>

        <div style={{ position:"relative", zIndex:1 }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:52 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#16a34a,#84cc16)",
              display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(22,163,74,0.35)" }}>
              <Sprout size={20} color="#fff"/>
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:900, color:"#fff", fontFamily:"'Sora',sans-serif", letterSpacing:"-0.02em" }}>Kisaan Sevak</div>
              <div style={{ fontSize:9, fontWeight:700, color:"#84cc16", letterSpacing:"0.18em", textTransform:"uppercase" }}>Farmer First</div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`lft-${uiLang}`} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <h2 style={{ margin:"0 0 14px", fontSize:"clamp(2rem,3.5vw,2.8rem)", fontWeight:900,
                fontFamily:"'Sora',sans-serif", letterSpacing:"-0.04em", color:"#fff", lineHeight:1.1 }}>
                {t.login_h}
              </h2>
              <p style={{ margin:"0 0 44px", fontSize:15, lineHeight:1.7, color:"rgba(255,255,255,0.4)" }}>
                {t.login_sub}
              </p>
            </motion.div>
          </AnimatePresence>

          <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
            {t.f.slice(0,6).map((f, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <div style={{ width:20, height:20, borderRadius:6, flexShrink:0, marginTop:1,
                  background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.28)",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Check size={11} color="#4ade80"/>
                </div>
                <span style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.5)", lineHeight:1.5 }}>
                  <strong style={{ color:"rgba(255,255,255,0.85)", fontWeight:800 }}>{f.h}</strong> — {f.b}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:44 }}>
            {[[Lock,"Secure"],[BadgeCheck,"Verified"],[Leaf,"Free forever"]].map(([Icon,l],i) => (
              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:6,
                padding:"6px 14px", borderRadius:999, fontSize:11, fontWeight:700,
                background:"rgba(74,222,128,0.07)", color:"#4ade80", border:"1px solid rgba(74,222,128,0.16)" }}>
                <Icon size={11}/>{l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ background:"#fff", display:"flex", flexDirection:"column",
        justifyContent:"center", padding:"64px 60px", overflowY:"auto" }}>

        <div style={{ maxWidth:440, width:"100%", margin:"0 auto" }}>
          <AnimatePresence mode="wait">
            <motion.div key={`rf-${uiLang}`} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <p style={{ margin:"0 0 4px", fontSize:11, fontWeight:800, letterSpacing:"0.18em",
                textTransform:"uppercase", color:"#16a34a" }}>Kisaan Sevak</p>
              <h2 style={{ margin:"0 0 6px", fontSize:"clamp(1.6rem,2.5vw,2.2rem)", fontWeight:900,
                fontFamily:"'Sora',sans-serif", letterSpacing:"-0.04em", color:"#0a0f07" }}>
                {t.login_h}
              </h2>
              <p style={{ margin:"0 0 28px", fontSize:13, color:"#8a8075" }}>{t.login_sub}</p>
            </motion.div>
          </AnimatePresence>

          {/* Portal picker */}
          <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:800, letterSpacing:"0.14em",
            textTransform:"uppercase", color:"#b0a898" }}>{t.iam}</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
            {[
              { v:"farmer", Icon:Leaf,  l:t.f_label, s:t.f_sub },
              { v:"buyer",  Icon:Store, l:t.b_label, s:t.b_sub },
            ].map(p => (
              <button key={p.v} type="button" onClick={() => { setSelP(p.v); reset(); }}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px",
                  borderRadius:16, textAlign:"left", cursor:"pointer", transition:"all .15s",
                  border: selP===p.v ? "2px solid #16a34a" : "2px solid #e8e3da",
                  background: selP===p.v ? "#f0fdf4" : "#faf7f2" }}>
                <div style={{ width:34, height:34, borderRadius:10, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background: selP===p.v ? "#dcfce7" : "#e8e3da" }}>
                  <p.Icon size={15} color={selP===p.v?"#16a34a":"#9a8f80"}/>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color: selP===p.v?"#166534":"#2a2a2a", lineHeight:1.2 }}>{p.l}</div>
                  <div style={{ fontSize:11, color: selP===p.v?"#16a34a":"#9a8f80", marginTop:1 }}>{p.s}</div>
                </div>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selP==="buyer" && (
              <motion.div key="bn" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                exit={{ opacity:0, height:0 }} transition={{ duration:0.2 }}
                style={{ marginBottom:14, padding:"10px 14px", borderRadius:12, fontSize:12, lineHeight:1.6,
                  background:"#fffbeb", border:"1px solid #fde68a", color:"#92400e" }}>
                {t.buyer_note}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode tabs */}
          <div style={{ display:"flex", gap:4, padding:4, borderRadius:14, background:"#f0ece4", marginBottom:22 }}>
            {["signin","signup"].map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); reset(); }}
                style={{ flex:1, padding:"10px 0", borderRadius:10, fontSize:13, fontWeight:800,
                  border:"none", cursor:"pointer", transition:"all .18s",
                  background: mode===m ? "#fff" : "transparent",
                  color: mode===m ? "#0a0f07" : "#9a8f80",
                  boxShadow: mode===m ? "0 1px 8px rgba(0,0,0,0.08)" : "none" }}>
                {m==="signin" ? t.tab_in : t.tab_up}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <AnimatePresence>
              {isUp && (
                <motion.div key="fn" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                  exit={{ opacity:0, height:0 }} transition={{ duration:0.22 }}>
                  <FF label={t.fn} value={fullName} placeholder={t.pn}
                    onChange={e => { setFullName(e.target.value); reset(); }} disabled={busy}/>
                </motion.div>
              )}
            </AnimatePresence>

            <FF label={t.fu} value={username} placeholder={t.pu}
              onChange={e => { setUsername(e.target.value); reset(); }}
              disabled={busy} autoComplete="username"/>

            <div style={{ position:"relative" }}>
              <FF label={t.fp} value={password} type={showPw?"text":"password"} placeholder={t.pp}
                onChange={e => { setPassword(e.target.value); reset(); }}
                disabled={busy} autoComplete={isUp?"new-password":"current-password"}/>
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position:"absolute", right:14, bottom:14, background:"none", border:"none",
                  cursor:"pointer", color:"#b0a898", display:"flex", padding:0 }}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>

            {/* Password strength bar (signup only) */}
            <AnimatePresence>
              {isUp && password.length > 0 && (
                <motion.div key="pws" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                  exit={{ opacity:0, height:0 }} transition={{ duration:0.2 }}>
                  <div style={{ display:"flex", gap:4, marginTop:-6 }}>
                    {[1,2,3,4].map(v => (
                      <div key={v} style={{ flex:1, height:3, borderRadius:99, transition:"background .25s",
                        background: pwStr >= v ? STRENGTH_COLOR[pwStr] : "#e8e3da" }}/>
                    ))}
                  </div>
                  <p style={{ margin:"4px 0 0", fontSize:11, fontWeight:600,
                    color: STRENGTH_COLOR[pwStr] }}>{t.pw_strength[pwStr]}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isUp && (
                <motion.div key="fc" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                  exit={{ opacity:0, height:0 }} transition={{ duration:0.22 }}>
                  <FF label={t.fc} value={confirm} type={showPw?"text":"password"} placeholder={t.pc}
                    onChange={e => { setConfirm(e.target.value); reset(); }}
                    disabled={busy} autoComplete="new-password"
                    hasError={confirm.length > 0 && confirm !== password}/>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div key="err" initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  style={{ padding:"10px 14px", borderRadius:12, fontSize:12, fontWeight:600,
                    background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626" }}>
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div key="ok2" initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  style={{ padding:"10px 14px", borderRadius:12, fontSize:12, fontWeight:600,
                    background:"#f0fdf4", border:"1px solid #bbf7d0", color:"#16a34a" }}>
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={!canSubmit || busy}
              whileHover={canSubmit && !busy ? { scale:1.02 } : {}}
              whileTap={canSubmit && !busy ? { scale:0.97 } : {}}
              style={{ marginTop:4, display:"flex", alignItems:"center", justifyContent:"center",
                gap:10, minHeight:52, borderRadius:16, fontSize:15, fontWeight:800, border:"none",
                cursor: canSubmit && !busy ? "pointer" : "not-allowed", transition:"background .2s, box-shadow .2s",
                background: canSubmit && !busy ? "linear-gradient(135deg,#16a34a,#15803d)" : "#e5e7eb",
                color: canSubmit && !busy ? "#fff" : "rgba(0,0,0,0.28)",
                boxShadow: canSubmit && !busy ? "0 8px 28px rgba(22,163,74,0.35)" : "none" }}>
              {busy
                ? <><div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.2)",
                    borderTopColor:"#fff", animation:"spin 0.7s linear infinite" }}/>{t.bw}</>
                : isUp
                  ? <>{t.bu}<ArrowRight size={16}/></>
                  : <>{t.bi}<ArrowRight size={16}/></>
              }
            </motion.button>

            <p style={{ textAlign:"center", fontSize:12, color:"#b0a898", margin:0 }}>
              <button type="button" onClick={() => { setMode(isUp?"signin":"signup"); reset(); }}
                style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
                  color:"#16a34a", textDecoration:"underline", textUnderlineOffset:3 }}>
                {isUp ? t.sw_in : t.sw_up}
              </button>
            </p>
          </form>

          {/* Trust row */}
          <div style={{ marginTop:28, paddingTop:24, borderTop:"1px solid #f0ece4",
            display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
            {[[ShieldCheck,"Secure auth"],[Lock,"Encrypted"],[BadgeCheck,"Trusted by 12k+"]].map(([Icon,l],i) => (
              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:5,
                fontSize:11, fontWeight:600, color:"#9a8f80" }}>
                <Icon size={12} color="#16a34a"/>{l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── FOOTER ───────────────────────────────────────────── */}
    <footer style={{ background:"#050d03", borderTop:"1px solid rgba(74,222,128,0.08)", padding:"36px 24px" }}>
      <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", flexWrap:"wrap",
        alignItems:"center", justifyContent:"space-between", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#16a34a,#84cc16)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Sprout size={14} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:900, color:"#fff", fontFamily:"'Sora',sans-serif" }}>Kisaan Sevak</div>
            <div style={{ fontSize:9, color:"#4ade80", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>Farmer First</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:24 }}>
          {[["#about","About"],["#features","Features"],["#stories","Stories"],["#login","Sign In"]].map(([h,l]) => (
            <a key={h} href={h} style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.3)", textDecoration:"none", transition:"color .15s" }}
              onMouseEnter={e=>e.target.style.color="#84cc16"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.18)", margin:0 }}>© {new Date().getFullYear()} Kisaan Sevak. Built for India's farmers.</p>
      </div>
    </footer>

    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      * { box-sizing: border-box; }

      @media (max-width: 768px) {
        .login-section { grid-template-columns: 1fr !important; }
        .login-left { display: none !important; }
      }

      @media (max-width: 900px) {
        .login-section { min-height: auto !important; }
      }

      @media (max-width: 640px) {
        .hidden.md\\:flex { display: none !important; }
      }
    `}</style>
    </div>
  );
}

/* ─── Form field component ────────────────────────── */
function FF({ label, value, onChange, type = "text", placeholder, disabled, autoComplete, hasError }) {
  const [focused, setFocused] = useState(false);

  let borderColor = "#e0dbd0";
  if (focused) borderColor = "#16a34a";
  if (hasError) borderColor = "#ef4444";

  return (
    <label style={{ display:"block" }}>
      <span style={{ display:"block", marginBottom:6, fontSize:11, fontWeight:800,
        letterSpacing:"0.14em", textTransform:"uppercase",
        color: hasError ? "#ef4444" : "#b0a898" }}>
        {label}
      </span>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        disabled={disabled} autoComplete={autoComplete}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width:"100%", padding:"13px 16px", borderRadius:14, fontSize:14, fontWeight:500,
          background:"#faf7f2", border:`2px solid ${borderColor}`,
          color:"#0a0f07", outline:"none", transition:"border-color .15s",
          opacity: disabled ? 0.5 : 1 }}
      />
    </label>
  );
}
