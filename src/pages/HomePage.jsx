import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Leaf, Store, Eye, EyeOff, ArrowRight, Globe,
  ShieldCheck, Users, Sprout, Tractor, CloudSun, MessageSquare,
  Check, ChevronDown, BadgeCheck, Wheat, BarChart3, Lock,
  TrendingUp, Zap, Star
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

/* ─── copy ───────────────────────────────────────────── */
const T = {
  en: {
    eyebrow: "India's farmer-first platform",
    h1: "Where every",
    h1_accent: "harvest",
    h1_end: "finds its worth.",
    sub: "Live mandi prices. AI advice. Government schemes. Waste auctions. All in your language.",
    cta: "Start farming smarter",
    cta2: "See how it works",
    about_h: "Built from the fields, for the fields.",
    about_p: "Kisaan Sevak was born from one simple truth — Indian farmers deserve real-time tools, not outdated guesswork. 12,000+ farmers across 9 states now price better, sell faster, and earn more.",
    feat_label: "What you get",
    feat_h: "Everything in one place.",
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
      { name:"Ravi Patil",    loc:"Wheat · Belgaum",
        t:"Sold wheat straw for ₹18,000 I used to burn. That paid my son's school fees." },
      { name:"Anita Reddy",   loc:"Cotton · Solapur",
        t:"Held 3 extra days on Mandi Mitra's signal. Got ₹200 more per quintal." },
      { name:"Suresh Kumar",  loc:"Buyer · Bengaluru",
        t:"Clean contracts, escrow payments, zero middlemen. First platform I fully trust." },
    ],
    stats: [
      { n:"12,000+", l:"Farmers" },
      { n:"₹4.2 Cr", l:"Auction volume" },
      { n:"98%",     l:"Payment success" },
      { n:"9",       l:"States" },
    ],
    login_h: "Your farm awaits.",
    login_sub: "Free forever for farmers. No paperwork.",
    iam: "I am a",
    f_label:"Farmer", f_sub:"Grow & sell crops",
    b_label:"Buyer / Enterprise", b_sub:"Buy verified produce",
    buyer_note: "Buyer accounts are reviewed before marketplace access is granted.",
    tab_in:"Sign in", tab_up:"Sign up",
    fn:"Full name", fu:"Username", fp:"Password", fc:"Confirm password",
    pn:"Ravi Patil", pu:"ravi_patil", pp:"Min. 6 characters", pc:"Re-enter password",
    bi:"Sign in", bu:"Create account", bw:"Just a moment…",
    sw_up:"No account? Sign up free", sw_in:"Have an account? Sign in",
  },
  hi: {
    eyebrow: "भारत का किसान-पहले प्लेटफॉर्म",
    h1: "जहाँ हर", h1_accent: "फसल", h1_end: "को सही दाम मिलता है।",
    sub: "लाइव मंडी भाव। AI सलाह। सरकारी योजनाएँ। अवशेष नीलामी। आपकी भाषा में।",
    cta: "स्मार्ट खेती शुरू करें", cta2: "कैसे काम करता है",
    about_h: "खेतों से, खेतों के लिए बना।",
    about_p: "किसान सेवक एक सच से जन्मा — भारतीय किसानों को रियल-टाइम टूल चाहिए, पुराना अनुमान नहीं। 9 राज्यों के 12,000+ किसान अब बेहतर दाम पाते हैं।",
    feat_label: "क्या मिलता है",
    feat_h: "सब एक जगह।",
    f: [
      { h:"लाइव मंडी भाव",    b:"200+ मंडियाँ। रियल-टाइम। AI बताए कब बेचें।" },
      { h:"अवशेष → कमाई",    b:"पराली, पुआल, डंठल — जलाते थे वो अब बिकता है।" },
      { h:"रोज़ की ब्रीफ",    b:"सुबह का मौसम, खेत के काम, फसल कैलेंडर — सुनाया जाए।" },
      { h:"सरकारी योजनाएँ",   b:"पीएम-किसान, ड्रिप सब्सिडी — पात्रता जानें, आवेदन करें।" },
      { h:"किसान नेटवर्क",    b:"कीट चेतावनी, पानी की खबर नज़दीकी किसानों से।" },
      { h:"AI फसल सलाहकार",   b:"बीमारी, छिड़काव, अगली फसल — हिंदी में।" },
      { h:"उपकरण किराया",     b:"ट्रैक्टर, स्प्रेयर — नज़दीकी किसान से पारदर्शी दाम पर।" },
      { h:"फसल बीमा",         b:"कोटेशन तुलना, क्लेम ट्रैकिंग — बिना झंझट।" },
    ],
    stories_h: "असली किसान। असली कमाई।",
    q: [
      { name:"रवि पाटिल",    loc:"गेहूँ · बेलगाम",
        t:"₹18,000 में पराली बेची जो जलाता था। बेटे की फीस उससे भरी।" },
      { name:"अनिता रेड्डी", loc:"कपास · सोलापुर",
        t:"3 दिन रुकी। क्विंटल पर ₹200 ज़्यादा मिले।" },
      { name:"सुरेश कुमार",  loc:"खरीदार · बेंगलुरु",
        t:"साफ़ कॉन्ट्रैक्ट, एस्क्रो भुगतान, कोई बिचौलिया नहीं।" },
    ],
    stats:[{n:"12,000+",l:"किसान"},{n:"₹4.2 Cr",l:"नीलामी"},{n:"98%",l:"भुगतान"},{n:"9",l:"राज्य"}],
    login_h:"आपका खेत इंतज़ार कर रहा है।", login_sub:"किसानों के लिए हमेशा मुफ़्त।",
    iam:"मैं हूँ", f_label:"किसान", f_sub:"फसल उगाएँ और बेचें",
    b_label:"खरीदार / एंटरप्राइज़", b_sub:"सत्यापित उपज खरीदें",
    buyer_note:"बाज़ार पहुँच से पहले खरीदार खाते की टीम समीक्षा करती है।",
    tab_in:"साइन इन", tab_up:"साइन अप",
    fn:"पूरा नाम", fu:"यूज़रनेम", fp:"पासवर्ड", fc:"पासवर्ड दोबारा",
    pn:"रवि पाटिल", pu:"ravi_patil", pp:"कम से कम 6 अक्षर", pc:"पासवर्ड फिर लिखें",
    bi:"साइन इन करें", bu:"खाता बनाएँ", bw:"प्रतीक्षा करें…",
    sw_up:"नए हैं? साइन अप करें", sw_in:"खाता है? साइन इन करें",
  },
  kn: {
    eyebrow: "ಭಾರತದ ರೈತ-ಮೊದಲ ವೇದಿಕೆ",
    h1: "ಪ್ರತಿ", h1_accent: "ಕೊಯ್ಲು", h1_end: "ತನ್ನ ಮೌಲ್ಯ ಕಂಡುಕೊಳ್ಳುತ್ತದೆ.",
    sub: "ಲೈವ್ ಮಂಡಿ ಬೆಲೆ. AI ಸಲಹೆ. ಸರ್ಕಾರಿ ಯೋಜನೆ. ಅವಶೇಷ ಹರಾಜು. ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ.",
    cta: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಆರಂಭಿಸಿ", cta2: "ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
    about_h: "ಹೊಲದಿಂದ, ಹೊಲಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.",
    about_p: "ಕಿಸಾನ್ ಸೇವಕ್ ಒಂದು ಸತ್ಯದಿಂದ ಜನಿಸಿತು — ಭಾರತೀಯ ರೈತರಿಗೆ ರಿಯಲ್-ಟೈಮ್ ಉಪಕರಣ ಬೇಕು. 9 ರಾಜ್ಯಗಳ 12,000+ ರೈತರು ಉತ್ತಮ ಬೆಲೆ ಪಡೆಯುತ್ತಿದ್ದಾರೆ.",
    feat_label: "ಏನು ಸಿಗುತ್ತದೆ",
    feat_h: "ಎಲ್ಲವೂ ಒಂದೇ ಜಾಗದಲ್ಲಿ.",
    f: [
      { h:"ಲೈವ್ ಮಂಡಿ ಬೆಲೆ",    b:"200+ ಮಂಡಿ. ರಿಯಲ್-ಟೈಮ್. AI ಯಾವಾಗ ಮಾರಬೇಕೆಂದು ಹೇಳುತ್ತದೆ." },
      { h:"ಅವಶೇಷ → ಆದಾಯ",       b:"ಹೊಲ್ಲು, ಕಡ್ಡಿ — ಸುಡುತ್ತಿದ್ದದ್ದರಿಂದ ಹಣ ಗಳಿಸಿ." },
      { h:"ದೈನಂದಿನ ಬ್ರೀಫ್",      b:"ಬೆಳಗಿನ ಹವಾಮಾನ, ಕೆಲಸ — ಓದಿ ಹೇಳಲಾಗುತ್ತದೆ." },
      { h:"ಸರ್ಕಾರಿ ಯೋಜನೆ",       b:"ಪಿಎಂ-ಕಿಸಾನ್, ಡ್ರಿಪ್ ಸಬ್ಸಿಡಿ — ಅರ್ಜಿ ಸಲ್ಲಿಸಿ." },
      { h:"ಕಿಸಾನ್ ನೆಟ್ವರ್ಕ್",     b:"ಕೀಟ ಎಚ್ಚರಿಕೆ, ನೀರಿನ ಸುದ್ದಿ ಹಂಚಿಕೊಳ್ಳಿ." },
      { h:"AI ಬೆಳೆ ಸಲಹೆ",        b:"ರೋಗ, ಸಿಂಪಡಣೆ — ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರ." },
      { h:"ಉಪಕರಣ ಬಾಡಿಗೆ",         b:"ಟ್ರ್ಯಾಕ್ಟರ್ — ಸಮೀಪದ ರೈತರಿಂದ ಪಾರದರ್ಶಕ ದರದಲ್ಲಿ." },
      { h:"ಬೆಳೆ ವಿಮೆ",            b:"ಉದ್ಧರಣ ಹೋಲಿಸಿ, ದಾವೆ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ." },
    ],
    stories_h: "ನಿಜ ರೈತರು. ನಿಜ ಹಣ.",
    q: [
      { name:"ರವಿ ಪಾಟೀಲ್",     loc:"ಗೋಧಿ · ಬೆಳಗಾವಿ",
        t:"₹18,000ಕ್ಕೆ ಹೊಲ್ಲು ಮಾರಿದೆ — ಸುಡುತ್ತಿದ್ದೆ. ಮಗನ ಶಾಲೆ ಶುಲ್ಕ ಕಟ್ಟಿದೆ." },
      { name:"ಅನಿತಾ ರೆಡ್ಡಿ",    loc:"ಹತ್ತಿ · ಸೋಲಾಪುರ",
        t:"3 ದಿನ ಕಾದೆ. ಕ್ವಿಂಟಲ್‌ಗೆ ₹200 ಹೆಚ್ಚು ಸಿಕ್ಕಿತು." },
      { name:"ಸುರೇಶ್ ಕುಮಾರ್",   loc:"ಖರೀದಿದಾರ · ಬೆಂಗಳೂರು",
        t:"ಸ್ಪಷ್ಟ ಒಪ್ಪಂದ, ಎಸ್ಕ್ರೋ, ಮಧ್ಯವರ್ತಿ ಇಲ್ಲ." },
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
  },
};

const LANGS = [{code:"en",native:"EN"},{code:"hi",native:"हि"},{code:"kn",native:"ಕ"}];
const FEAT_ICONS  = [BarChart3,Wheat,CloudSun,ShieldCheck,Users,MessageSquare,Tractor,BadgeCheck];
const FEAT_COLORS = ["#22c55e","#eab308","#38bdf8","#a78bfa","#34d399","#fb923c","#f472b6","#6ee7b7"];
const FEAT_BG     = ["#052e16","#422006","#082f49","#2e1065","#064e3b","#431407","#500724","#064e3b"];

function redir(p){return p==="buyer"||p==="enterprise"?"/buyer-portal":p==="admin"?"/admin":"/farmer-dashboard";}
function norm(v){return v==="enterprise"?"buyer":v;}
function ok(v){return Boolean(String(v||"").trim());}

/* ─── Grain texture overlay ──────────────────────── */
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ─── Main export ──────────────────────────────── */
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
  const [langOpen, setLangOpen] = useState(false);
  const [mode,     setMode]     = useState("signin");
  const [selP,     setSelP]     = useState("farmer");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [uname,    setUname]    = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");
  const [ok2,      setOk2]      = useState("");

  const t   = T[uiLang] || T.en;
  const isUp = mode === "signup";
  const cp  = useMemo(() => norm(selP), [selP]);
  const can = useMemo(() => {
    if (isUp) return ok(username) && ok(uname) && password.length >= 6 && password === confirm;
    return ok(username) && ok(password);
  }, [isUp, username, uname, password, confirm]);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate(redir(portal), { replace: true });
  }, [isAuthenticated, loading, navigate, portal]);

  const swLang = useCallback((c) => { setUiLang(c); setLanguage(c); setLangOpen(false); }, [setLanguage]);
  const rst = () => { setError(""); setOk2(""); };

  async function submit(e) {
    e.preventDefault();
    if (!can) return;
    setBusy(true); rst();
    try {
      if (isUp) {
        await signUp({ username: username.trim(), password, name: uname.trim(), role: cp });
        setOk2("✓ Account created!");
      } else {
        await signIn({ username: username.trim(), password, role: cp });
        setOk2("✓ Welcome back!");
      }
      setTimeout(() => navigate(redir(cp), { replace: true }), 320);
    } catch (err) { setError(err?.message || "Something went wrong."); }
    finally { setBusy(false); }
  }

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0a0f07"}}>
      <div style={{width:36,height:36,borderRadius:"50%",border:"3px solid #1a3a10",borderTopColor:"#4ade80",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (isAuthenticated) return <Navigate to={redir(portal)} replace />;

  /* ─── shared styles ─── */
  const S = {
    page: { fontFamily:"'Manrope','Sora',sans-serif", background:"#faf7f2", color:"#1a1a1a", overflowX:"hidden" },
    /* Nav */
    nav: { position:"sticky", top:0, zIndex:50, background:"rgba(10,15,7,0.92)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.05)" },
    navInner: { maxWidth:1280, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 28px" },
    logo: { display:"flex", alignItems:"center", gap:10 },
    logoMark: { width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#16a34a,#84cc16)", display:"flex", alignItems:"center", justifyContent:"center" },
    logoText: { fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:16, color:"#fff", letterSpacing:"-0.02em" },
    logoSub: { fontSize:9, fontWeight:700, color:"#84cc16", letterSpacing:"0.18em", textTransform:"uppercase" },
  };

  return (
    <div style={S.page}>

    {/* ──────────────────────────────────────────────
        NAV
    ────────────────────────────────────────────── */}
    <header style={S.nav}>
      <div style={S.navInner}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoMark}><Sprout size={17} color="#fff"/></div>
          <div><div style={S.logoText}>Kisaan Sevak</div><div style={S.logoSub}>Farmer First</div></div>
        </div>

        {/* Centre links — desktop */}
        <nav style={{display:"flex",gap:32,alignItems:"center"}} className="hidden md:flex">
          {[["#about","About"],["#features","Features"],["#stories","Stories"],["#login","Login"]].map(([h,l])=>(
            <a key={h} href={h} style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.5)",textDecoration:"none",transition:"color .15s"}}
              onMouseEnter={e=>e.target.style.color="#84cc16"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.5)"}>{l}</a>
          ))}
        </nav>

        {/* Right */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {/* Language pills */}
          <div style={{display:"flex",gap:4}}>
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>swLang(l.code)}
                style={{padding:"5px 10px",borderRadius:8,fontSize:11,fontWeight:800,border:"none",cursor:"pointer",transition:"all .15s",
                  background:uiLang===l.code?"#16a34a":"rgba(255,255,255,0.07)",
                  color:uiLang===l.code?"#fff":"rgba(255,255,255,0.4)"}}>
                {l.native}
              </button>
            ))}
          </div>
          <button onClick={()=>loginRef.current?.scrollIntoView({behavior:"smooth"})}
            style={{padding:"9px 20px",borderRadius:12,fontSize:13,fontWeight:800,border:"none",cursor:"pointer",
              background:"linear-gradient(135deg,#16a34a,#15803d)",color:"#fff",boxShadow:"0 4px 16px rgba(22,163,74,0.4)",
              transition:"transform .15s"}}
            onMouseEnter={e=>e.target.style.transform="scale(1.04)"} onMouseLeave={e=>e.target.style.transform="scale(1)"}>
            Get started
          </button>
        </div>
      </div>
    </header>

    {/* ──────────────────────────────────────────────
        HERO — editorial full bleed dark
    ────────────────────────────────────────────── */}
    <section ref={heroRef} style={{position:"relative",minHeight:"100vh",overflow:"hidden",
      background:"linear-gradient(160deg,#050d03 0%,#0a1f07 40%,#0d2a09 100%)",
      display:"flex",alignItems:"center",paddingBottom:160}}>

      {/* Parallax grain + glow */}
      <motion.div style={{position:"absolute",inset:0,y:heroY}} aria-hidden>
        {/* big radial glow centre-left */}
        <div style={{position:"absolute",top:"15%",left:"5%",width:700,height:700,borderRadius:"50%",
          background:"radial-gradient(ellipse,rgba(22,163,74,0.22) 0%,transparent 65%)"}}/>
        {/* accent glow top-right */}
        <div style={{position:"absolute",top:"-5%",right:"10%",width:400,height:400,borderRadius:"50%",
          background:"radial-gradient(ellipse,rgba(132,204,22,0.12) 0%,transparent 65%)"}}/>
        {/* grain */}
        <div style={{position:"absolute",inset:0,backgroundImage:GRAIN,opacity:0.6}}/>
        {/* subtle grid lines */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.04}} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60 0 L0 0 0 60" fill="none" stroke="#4ade80" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </motion.div>

      {/* Floating crop icons — decorative */}
      {[
        {Icon:Wheat,     x:"78%", y:"18%", s:28, rot:15,  op:0.12},
        {Icon:Sprout,    x:"88%", y:"55%", s:22, rot:-10, op:0.10},
        {Icon:Leaf,      x:"72%", y:"75%", s:20, rot:25,  op:0.09},
        {Icon:CloudSun,  x:"5%",  y:"72%", s:24, rot:0,   op:0.08},
        {Icon:Tractor,   x:"90%", y:"30%", s:20, rot:5,   op:0.09},
      ].map(({Icon,x,y,s,rot,op},i)=>(
        <motion.div key={i} aria-hidden
          initial={{opacity:0,scale:0.5}} animate={{opacity:op,scale:1}}
          transition={{delay:0.4+i*0.15,duration:1.2,ease:"easeOut"}}
          style={{position:"absolute",left:x,top:y,color:"#84cc16",transform:`rotate(${rot}deg)`}}>
          <Icon size={s}/>
        </motion.div>
      ))}

      {/* Content */}
      <motion.div style={{position:"relative",zIndex:10,maxWidth:1280,margin:"0 auto",
        padding:"100px 28px 0",width:"100%",opacity:heroO}}>

        <AnimatePresence mode="wait">
          <motion.div key={`hero-${uiLang}`}
            initial={{opacity:0,y:32}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}}
            transition={{duration:0.6,ease:[0.22,1,0.36,1]}}>

            {/* Eyebrow */}
            <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:24,
              padding:"6px 16px",borderRadius:999,border:"1px solid rgba(132,204,22,0.3)",
              background:"rgba(132,204,22,0.06)"}}>
              <Zap size={12} color="#84cc16"/>
              <span style={{fontSize:12,fontWeight:700,color:"#84cc16",letterSpacing:"0.05em"}}>{t.eyebrow}</span>
            </div>

            {/* Giant headline */}
            <h1 style={{margin:0,lineHeight:1.0,letterSpacing:"-0.04em",fontFamily:"'Sora',sans-serif",fontWeight:900,
              fontSize:"clamp(3.2rem,8vw,7rem)",color:"#fff",maxWidth:900}}>
              {t.h1}{" "}
              <span style={{display:"inline-block",position:"relative"}}>
                <span style={{background:"linear-gradient(120deg,#4ade80,#84cc16,#a3e635)",
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                  {t.h1_accent}
                </span>
                {/* underline squiggle */}
                <svg style={{position:"absolute",bottom:-8,left:0,width:"100%"}} viewBox="0 0 200 12" fill="none">
                  <path d="M2 8 Q50 2 100 8 Q150 14 198 6" stroke="#84cc16" strokeWidth="2.5"
                    strokeLinecap="round" opacity="0.6"/>
                </svg>
              </span>{" "}
              <span style={{color:"rgba(255,255,255,0.85)"}}>{t.h1_end}</span>
            </h1>

            {/* Sub */}
            <p style={{marginTop:28,fontSize:17,lineHeight:1.65,color:"rgba(255,255,255,0.5)",maxWidth:520,fontWeight:400}}>
              {t.sub}
            </p>

            {/* CTAs */}
            <div style={{marginTop:40,display:"flex",flexWrap:"wrap",gap:14,alignItems:"center"}}>
              <motion.button onClick={()=>loginRef.current?.scrollIntoView({behavior:"smooth"})}
                whileHover={{scale:1.04}} whileTap={{scale:0.97}}
                style={{display:"inline-flex",alignItems:"center",gap:10,padding:"14px 30px",
                  borderRadius:16,fontSize:15,fontWeight:800,border:"none",cursor:"pointer",
                  background:"linear-gradient(135deg,#16a34a,#15803d)",color:"#fff",
                  boxShadow:"0 8px 32px rgba(22,163,74,0.45)"}}>
                {t.cta} <ArrowRight size={17}/>
              </motion.button>
              <a href="#features"
                style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:14,fontWeight:700,
                  color:"rgba(255,255,255,0.4)",textDecoration:"none",transition:"color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.4)"}>
                {t.cta2} <ArrowRight size={14}/>
              </a>
            </div>


          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Bottom wave into next section */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,lineHeight:0}} aria-hidden>
        <svg viewBox="0 0 1440 140" style={{width:"100%",display:"block"}}>
          <path d="M0 140 L0 90 Q240 20 480 65 Q720 110 960 50 Q1200 10 1440 70 L1440 140 Z" fill="#faf7f2"/>
        </svg>
      </div>
    </section>

    {/* ──────────────────────────────────────────────
        ABOUT — cream editorial, big pull-quote left
    ────────────────────────────────────────────── */}
    <section id="about" style={{background:"#faf7f2",padding:"120px 28px"}}>
      <div style={{maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center"}}
        className="grid-cols-1 md:grid-cols-2">

        <AnimatePresence mode="wait">
          <motion.div key={`ab-${uiLang}`} initial={{opacity:0,x:-24}} whileInView={{opacity:1,x:0}}
            viewport={{once:true}} transition={{duration:0.7}}>
            {/* Large decorative letter */}
            <div style={{fontSize:"clamp(6rem,15vw,12rem)",fontWeight:900,fontFamily:"'Sora',sans-serif",
              lineHeight:0.85,letterSpacing:"-0.06em",userSelect:"none",
              background:"linear-gradient(135deg,#d1fae5,#a7f3d0)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
              marginBottom:24}}>
              KS
            </div>
            <h2 style={{fontSize:"clamp(1.6rem,3vw,2.4rem)",fontWeight:900,fontFamily:"'Sora',sans-serif",
              lineHeight:1.2,letterSpacing:"-0.03em",color:"#0a0f07",margin:"0 0 20px"}}>
              {t.about_h}
            </h2>
            <p style={{fontSize:16,lineHeight:1.8,color:"#4a5040",maxWidth:440,margin:"0 0 36px"}}>
              {t.about_p}
            </p>
            <button onClick={()=>loginRef.current?.scrollIntoView({behavior:"smooth"})}
              style={{display:"inline-flex",alignItems:"center",gap:10,padding:"12px 28px",
                borderRadius:14,fontSize:14,fontWeight:800,border:"2px solid #16a34a",
                background:"transparent",color:"#16a34a",cursor:"pointer",transition:"all .18s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#16a34a";e.currentTarget.style.color="#fff"}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#16a34a"}}>
              Get started free <ArrowRight size={15}/>
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Right — textured card mosaic */}
        <motion.div initial={{opacity:0,x:24}} whileInView={{opacity:1,x:0}}
          viewport={{once:true}} transition={{duration:0.7,delay:0.1}}
          style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {[
            {bg:"#052e16",c:"#4ade80",label:"12,000+",sub:"Farmers nationwide",Icon:Users},
            {bg:"#422006",c:"#fbbf24",label:"₹4.2 Cr",sub:"Auction volume",Icon:BarChart3},
            {bg:"#082f49",c:"#38bdf8",label:"98%",sub:"Payment success",Icon:BadgeCheck},
            {bg:"#2e1065",c:"#a78bfa",label:"9 States",sub:"Coverage & growing",Icon:Sprout},
          ].map((card,i)=>(
            <motion.div key={i} whileHover={{y:-4,scale:1.02}} transition={{duration:0.2}}
              style={{borderRadius:20,padding:"28px 22px",background:card.bg,
                border:"1px solid rgba(255,255,255,0.07)",position:"relative",overflow:"hidden"}}>
              <card.Icon size={20} color={card.c} style={{marginBottom:16,opacity:0.7}}/>
              <div style={{fontSize:"1.8rem",fontWeight:900,fontFamily:"'Sora',sans-serif",
                color:card.c,lineHeight:1}}>
                {card.label}
              </div>
              <div style={{marginTop:6,fontSize:11,fontWeight:600,
                color:"rgba(255,255,255,0.4)",letterSpacing:"0.04em"}}>
                {card.sub}
              </div>
              {/* glow */}
              <div style={{position:"absolute",bottom:-20,right:-20,width:80,height:80,
                borderRadius:"50%",background:card.c,opacity:0.07,filter:"blur(20px)"}}/>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ──────────────────────────────────────────────
        FEATURES — dark bento grid
    ────────────────────────────────────────────── */}
    <section id="features" style={{background:"#0a0f07",padding:"100px 28px"}}>
      <div style={{maxWidth:1280,margin:"0 auto"}}>

        <AnimatePresence mode="wait">
          <motion.div key={`fh-${uiLang}`} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            style={{marginBottom:56,maxWidth:640}}>
            <span style={{display:"inline-block",marginBottom:12,padding:"5px 14px",
              borderRadius:999,fontSize:11,fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase",
              background:"rgba(74,222,128,0.08)",color:"#4ade80",border:"1px solid rgba(74,222,128,0.2)"}}>
              {t.feat_label}
            </span>
            <h2 style={{margin:0,fontSize:"clamp(2rem,4vw,3rem)",fontWeight:900,
              fontFamily:"'Sora',sans-serif",letterSpacing:"-0.04em",
              color:"#fff",lineHeight:1.1}}>
              {t.feat_h}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Bento grid */}
        <div style={{display:"grid",gap:12,
          gridTemplateColumns:"repeat(4,1fr)",
          gridTemplateRows:"auto auto"}}>
          {t.f.map((f,i)=>{
            const Icon = FEAT_ICONS[i];
            const color = FEAT_COLORS[i];
            const bg = FEAT_BG[i];
            /* first card spans 2 cols */
            const wide = i === 0;
            const tall = i === 1;
            return (
              <motion.div key={`${uiLang}-f-${i}`}
                initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*0.06,duration:0.5}}
                whileHover={{y:-3,scale:1.015}} style={{
                  gridColumn: wide ? "span 2" : "span 1",
                  borderRadius:20,padding:wide?"32px 28px":"24px 22px",
                  background:bg,border:"1px solid rgba(255,255,255,0.06)",
                  position:"relative",overflow:"hidden",cursor:"default"}}>
                {/* accent glow */}
                <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,
                  borderRadius:"50%",background:color,opacity:0.08,filter:"blur(30px)"}}/>
                <div style={{position:"relative",zIndex:1}}>
                  <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",
                    width:44,height:44,borderRadius:14,marginBottom:18,
                    background:`${color}18`,border:`1px solid ${color}30`}}>
                    <Icon size={20} color={color}/>
                  </div>
                  <div style={{fontSize: wide?17:14,fontWeight:800,color:"#fff",marginBottom:8,
                    fontFamily:"'Sora',sans-serif",letterSpacing:"-0.02em"}}>
                    {f.h}
                  </div>
                  <div style={{fontSize:13,lineHeight:1.6,color:"rgba(255,255,255,0.45)"}}>
                    {f.b}
                  </div>
                </div>
                {/* bottom accent line */}
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,
                  background:`linear-gradient(90deg,${color},transparent)`,opacity:0.5}}/>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    {/* ──────────────────────────────────────────────
        STORIES — cream marquee-style testimonials
    ────────────────────────────────────────────── */}
    <section id="stories" style={{background:"#faf7f2",padding:"100px 28px",overflow:"hidden"}}>
      <div style={{maxWidth:1280,margin:"0 auto"}}>
        <AnimatePresence mode="wait">
          <motion.div key={`sh-${uiLang}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{marginBottom:56,display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:20}}>
            <h2 style={{margin:0,fontSize:"clamp(2rem,4vw,3rem)",fontWeight:900,
              fontFamily:"'Sora',sans-serif",letterSpacing:"-0.04em",color:"#0a0f07",lineHeight:1.1}}>
              {t.stories_h}
            </h2>
            <button onClick={()=>loginRef.current?.scrollIntoView({behavior:"smooth"})}
              style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:13,fontWeight:700,
                color:"#16a34a",background:"none",border:"none",cursor:"pointer",textDecoration:"underline",
                textUnderlineOffset:4}}>
              Join them <ArrowRight size={14}/>
            </button>
          </motion.div>
        </AnimatePresence>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}} className="grid-cols-1 md:grid-cols-3">
          {t.q.map((q,i)=>(
            <motion.div key={`${uiLang}-q-${i}`}
              initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
              viewport={{once:true}} transition={{delay:i*0.12,duration:0.55}}
              style={{borderRadius:24,padding:"32px 28px",position:"relative",overflow:"hidden",
                background: i===1 ? "#0a0f07" : "#fff",
                border: i===1 ? "1px solid rgba(74,222,128,0.2)" : "1px solid #e8e3da",
                boxShadow:"0 8px 40px rgba(0,0,0,0.06)"}}>

              {/* Quote mark */}
              <div style={{fontSize:80,fontWeight:900,lineHeight:0.8,marginBottom:20,
                color: i===1 ? "rgba(74,222,128,0.2)" : "rgba(0,0,0,0.06)",
                fontFamily:"Georgia,serif",userSelect:"none"}}>
                "
              </div>

              <p style={{fontSize:15,lineHeight:1.75,margin:"0 0 28px",
                color: i===1 ? "rgba(255,255,255,0.75)" : "#3a3a3a",fontStyle:"italic"}}>
                {q.t}
              </p>

              <div style={{display:"flex",alignItems:"center",gap:12,
                paddingTop:20,borderTop:`1px solid ${i===1?"rgba(255,255,255,0.08)":"#f0ece4"}`}}>
                <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",
                  justifyContent:"center",fontWeight:900,fontSize:16,color:"#fff",
                  background:"linear-gradient(135deg,#16a34a,#4d7c0f)"}}>
                  {q.name[0]}
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color: i===1?"#fff":"#0a0f07"}}>{q.name}</div>
                  <div style={{fontSize:11,fontWeight:600,color: i===1?"rgba(74,222,128,0.7)":"#9a8f80",
                    letterSpacing:"0.04em",marginTop:2}}>{q.loc}</div>
                </div>
                <div style={{marginLeft:"auto",display:"flex",gap:2}}>
                  {[0,1,2,3,4].map(j=>(
                    <Star key={j} size={12} fill="#f59e0b" color="#f59e0b"/>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ──────────────────────────────────────────────
        LOGIN — full-bleed split, dark left / light right
    ────────────────────────────────────────────── */}
    <section ref={loginRef} id="login" style={{minHeight:"100vh",display:"grid",gridTemplateColumns:"1fr 1fr"}}
      className="grid-cols-1 md:grid-cols-2">

      {/* Left — dark brand half */}
      <div style={{position:"relative",overflow:"hidden",padding:"80px 60px",
        background:"linear-gradient(160deg,#050d03 0%,#0a1f07 50%,#0d2a09 100%)",
        display:"flex",flexDirection:"column",justifyContent:"center"}}
        className="hidden md:flex">

        {/* bg glow */}
        <div style={{position:"absolute",top:"20%",left:"-10%",width:500,height:500,borderRadius:"50%",
          background:"radial-gradient(ellipse,rgba(22,163,74,0.18) 0%,transparent 70%)"}} aria-hidden/>
        <div style={{position:"absolute",inset:0,backgroundImage:GRAIN,opacity:0.5}} aria-hidden/>

        <div style={{position:"relative",zIndex:1}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:48}}>
            <div style={{width:38,height:38,borderRadius:12,
              background:"linear-gradient(135deg,#16a34a,#84cc16)",
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Sprout size={19} color="#fff"/>
            </div>
            <div>
              <div style={{fontSize:17,fontWeight:900,color:"#fff",fontFamily:"'Sora',sans-serif",letterSpacing:"-0.02em"}}>
                Kisaan Sevak
              </div>
              <div style={{fontSize:9,fontWeight:700,color:"#84cc16",letterSpacing:"0.18em",textTransform:"uppercase"}}>
                Farmer First
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`lft-${uiLang}`} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <h2 style={{margin:"0 0 16px",fontSize:"clamp(2rem,3.5vw,2.8rem)",fontWeight:900,
                fontFamily:"'Sora',sans-serif",letterSpacing:"-0.04em",color:"#fff",lineHeight:1.1}}>
                {t.login_h}
              </h2>
              <p style={{margin:"0 0 48px",fontSize:15,lineHeight:1.7,color:"rgba(255,255,255,0.45)"}}>
                {t.login_sub}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Feature checklist */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {t.f.slice(0,6).map((f,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{width:20,height:20,borderRadius:6,flexShrink:0,marginTop:1,
                  background:"rgba(74,222,128,0.15)",border:"1px solid rgba(74,222,128,0.3)",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Check size={11} color="#4ade80"/>
                </div>
                <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>
                  <strong style={{color:"rgba(255,255,255,0.9)",fontWeight:800}}>{f.h}</strong> — {f.b}
                </span>
              </div>
            ))}
          </div>

          {/* Trust row */}
          <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:48}}>
            {[[Lock,t.trust1??t.trust1],[BadgeCheck,"Verified"],[Leaf,"Free"]].map(([Icon,l],i)=>(
              <span key={i} style={{display:"inline-flex",alignItems:"center",gap:6,
                padding:"6px 14px",borderRadius:999,fontSize:11,fontWeight:700,
                background:"rgba(74,222,128,0.07)",color:"#4ade80",
                border:"1px solid rgba(74,222,128,0.18)"}}>
                <Icon size={11}/>{l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — clean form */}
      <div style={{background:"#fff",display:"flex",flexDirection:"column",
        justifyContent:"center",padding:"80px 60px 80px"}}>

        <AnimatePresence mode="wait">
          <motion.div key={`rf-${uiLang}`} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            style={{maxWidth:440,width:"100%",margin:"0 auto"}}>
            <p style={{margin:"0 0 4px",fontSize:11,fontWeight:800,letterSpacing:"0.18em",
              textTransform:"uppercase",color:"#16a34a"}}>Kisaan Sevak</p>
            <h2 style={{margin:"0 0 6px",fontSize:"clamp(1.6rem,2.5vw,2.2rem)",fontWeight:900,
              fontFamily:"'Sora',sans-serif",letterSpacing:"-0.04em",color:"#0a0f07"}}>
              {t.login_h}
            </h2>
            <p style={{margin:"0 0 32px",fontSize:13,color:"#8a8075"}}>{t.login_sub}</p>
          </motion.div>
        </AnimatePresence>

        <div style={{maxWidth:440,width:"100%",margin:"0 auto"}}>
          {/* Portal picker */}
          <p style={{margin:"0 0 10px",fontSize:11,fontWeight:800,letterSpacing:"0.14em",
            textTransform:"uppercase",color:"#b0a898"}}>{t.iam}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            {[{v:"farmer",Icon:Leaf,l:t.f_label,s:t.f_sub},{v:"buyer",Icon:Store,l:t.b_label,s:t.b_sub}].map(p=>(
              <button key={p.v} type="button" onClick={()=>{setSelP(p.v);rst();}}
                style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",
                  borderRadius:16,textAlign:"left",cursor:"pointer",
                  border: selP===p.v ? "2px solid #16a34a" : "2px solid #e8e3da",
                  background: selP===p.v ? "#f0fdf4" : "#faf7f2",
                  transition:"all .15s"}}>
                <div style={{width:34,height:34,borderRadius:10,flexShrink:0,display:"flex",
                  alignItems:"center",justifyContent:"center",
                  background: selP===p.v ? "#dcfce7" : "#e8e3da"}}>
                  <p.Icon size={15} color={selP===p.v?"#16a34a":"#9a8f80"}/>
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color: selP===p.v?"#166534":"#2a2a2a",lineHeight:1.2}}>{p.l}</div>
                  <div style={{fontSize:11,color: selP===p.v?"#16a34a":"#9a8f80",marginTop:1}}>{p.s}</div>
                </div>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selP==="buyer" && (
              <motion.p key="bn" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                exit={{opacity:0,height:0}} transition={{duration:0.2}}
                style={{marginBottom:16,padding:"10px 14px",borderRadius:12,fontSize:12,lineHeight:1.6,
                  background:"#fffbeb",border:"1px solid #fde68a",color:"#92400e"}}>
                {t.buyer_note}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Mode tabs */}
          <div style={{display:"flex",gap:4,padding:4,borderRadius:14,background:"#f0ece4",marginBottom:20}}>
            {["signin","signup"].map(m=>(
              <button key={m} type="button" onClick={()=>{setMode(m);rst();}}
                style={{flex:1,padding:"10px 0",borderRadius:10,fontSize:13,fontWeight:800,
                  border:"none",cursor:"pointer",transition:"all .18s",
                  background: mode===m?"#fff":"transparent",
                  color: mode===m?"#0a0f07":"#9a8f80",
                  boxShadow: mode===m?"0 1px 8px rgba(0,0,0,0.08)":"none"}}>
                {m==="signin"?t.tab_in:t.tab_up}
              </button>
            ))}
          </div>

          {/* Fields */}
          <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
            <AnimatePresence>
              {isUp && (
                <motion.div key="fn" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                  exit={{opacity:0,height:0}} transition={{duration:0.2}}>
                  <FF label={t.fn} value={uname} placeholder={t.pn} onChange={e=>{setUname(e.target.value);rst();}} disabled={busy}/>
                </motion.div>
              )}
            </AnimatePresence>
            <FF label={t.fu} value={username} placeholder={t.pu} onChange={e=>{setUsername(e.target.value);rst();}} disabled={busy} autoComplete="username"/>
            <div style={{position:"relative"}}>
              <FF label={t.fp} value={password} type={showPw?"text":"password"} placeholder={t.pp}
                onChange={e=>{setPassword(e.target.value);rst();}} disabled={busy}
                autoComplete={isUp?"new-password":"current-password"}/>
              <button type="button" onClick={()=>setShowPw(p=>!p)}
                style={{position:"absolute",right:14,bottom:14,background:"none",border:"none",cursor:"pointer",color:"#b0a898",display:"flex"}}>
                {showPw?<EyeOff size={15}/>:<Eye size={15}/>}
              </button>
            </div>
            <AnimatePresence>
              {isUp && (
                <motion.div key="fc" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                  exit={{opacity:0,height:0}} transition={{duration:0.2}}>
                  <FF label={t.fc} value={confirm} type={showPw?"text":"password"} placeholder={t.pc}
                    onChange={e=>{setConfirm(e.target.value);rst();}} disabled={busy} autoComplete="new-password"/>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && <motion.div key="err" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{padding:"10px 14px",borderRadius:12,fontSize:12,fontWeight:600,
                  background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626"}}>{error}</motion.div>}
              {ok2 && <motion.div key="ok2" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{padding:"10px 14px",borderRadius:12,fontSize:12,fontWeight:600,
                  background:"#f0fdf4",border:"1px solid #bbf7d0",color:"#16a34a"}}>{ok2}</motion.div>}
            </AnimatePresence>

            <motion.button type="submit" disabled={!can||busy}
              whileHover={can&&!busy?{scale:1.02}:{}}
              whileTap={can&&!busy?{scale:0.97}:{}}
              style={{marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",
                gap:10,minHeight:52,borderRadius:16,fontSize:15,fontWeight:800,border:"none",
                cursor: can&&!busy?"pointer":"not-allowed",transition:"background .2s",
                background: can&&!busy?"linear-gradient(135deg,#16a34a,#15803d)":"#d1d5db",
                color: can&&!busy?"#fff":"rgba(0,0,0,0.3)",
                boxShadow: can&&!busy?"0 8px 28px rgba(22,163,74,0.35)":"none"}}>
              {busy
                ? <><div style={{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.2)",borderTopColor:"#fff",animation:"spin 0.7s linear infinite"}}/>{t.bw}</>
                : isUp ? <>{t.bu}<ArrowRight size={16}/></> : <>{t.bi}<ArrowRight size={16}/></>
              }
            </motion.button>

            <p style={{textAlign:"center",fontSize:12,color:"#b0a898",margin:0}}>
              <button type="button" onClick={()=>{setMode(isUp?"signin":"signup");rst();}}
                style={{background:"none",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
                  color:"#16a34a",textDecoration:"underline",textUnderlineOffset:3}}>
                {isUp?t.sw_in:t.sw_up}
              </button>
            </p>
          </form>
        </div>
      </div>
    </section>

    {/* ──────────────────────────────────────────────
        FOOTER
    ────────────────────────────────────────────── */}
    <footer style={{background:"#050d03",borderTop:"1px solid rgba(74,222,128,0.08)",padding:"32px 28px"}}>
      <div style={{maxWidth:1280,margin:"0 auto",display:"flex",flexWrap:"wrap",
        alignItems:"center",justifyContent:"space-between",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#16a34a,#84cc16)",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Sprout size={14} color="#fff"/>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:900,color:"#fff",fontFamily:"'Sora',sans-serif"}}>Kisaan Sevak</div>
            <div style={{fontSize:9,color:"#4ade80",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase"}}>Farmer First</div>
          </div>
        </div>
        <div style={{display:"flex",gap:24}}>
          {[["#about","About"],["#features","Features"],["#stories","Stories"],["#login","Login"]].map(([h,l])=>(
            <a key={h} href={h} style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.3)",textDecoration:"none",transition:"color .15s"}}
              onMouseEnter={e=>e.target.style.color="#84cc16"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>{l}</a>
          ))}
        </div>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.18)",margin:0}}>© {new Date().getFullYear()} Kisaan Sevak</p>
      </div>
    </footer>

    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      * { box-sizing: border-box; }
      @media (max-width: 768px) {
        .hidden.md\\:flex { display: none !important; }
        .hidden.md\\:grid { display: none !important; }
      }
    `}</style>
    </div>
  );
}

/* ─── Form field ─────────────────────────────────── */
function FF({ label, value, onChange, type="text", placeholder, disabled, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{display:"block"}}>
      <span style={{display:"block",marginBottom:6,fontSize:11,fontWeight:800,
        letterSpacing:"0.14em",textTransform:"uppercase",color:"#b0a898"}}>
        {label}
      </span>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        disabled={disabled} autoComplete={autoComplete}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{width:"100%",padding:"13px 16px",borderRadius:14,fontSize:14,fontWeight:500,
          background:"#faf7f2",border:`2px solid ${focused?"#16a34a":"#e0dbd0"}`,
          color:"#0a0f07",outline:"none",transition:"border-color .15s",
          opacity: disabled ? 0.5 : 1}}
      />
    </label>
  );
}
