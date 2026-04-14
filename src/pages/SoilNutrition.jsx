import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Calculator, CheckCircle2, ExternalLink, Leaf, ShoppingBag, TestTube } from 'lucide-react';
import React, { useState } from 'react';
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../context/LanguageContext";

// --- Crop NPK Requirements (kg per acre) ---
const CROP_NPK_REQUIREMENTS = {
  "Wheat": { n: 48, p: 24, k: 16, tip: "Apply zinc sulphate @25kg/acre if soil Zn deficient" },
  "Rice": { n: 40, p: 24, k: 16, tip: "Iron deficiency common in high pH; foliar spray FeSO4" },
  "Maize": { n: 60, p: 30, k: 20, tip: "Apply boron @1kg/acre for cob filling" },
  "Cotton": { n: 48, p: 24, k: 24, tip: "Deficiency of B causes flower drop" },
  "Sugarcane": { n: 100, p: 34, k: 34, tip: "Earthing up after each N application" },
  "Soybean": { n: 12, p: 32, k: 16, tip: "Use Rhizobium inoculant for N fixation" },
  "Potato": { n: 60, p: 40, k: 60, tip: "Potassium improves tuber quality" },
  "Tomato": { n: 50, p: 30, k: 40, tip: "Calcium nitrate at flowering prevents blossom end rot" },
  "Groundnut": { n: 10, p: 40, k: 20, tip: "Gypsum @200kg/acre at pegging for pod filling" },
  "Onion": { n: 40, p: 20, k: 40, tip: "Sulphur @20kg/acre improves pungency" },
  "Pulses (Gram)": { n: 15, p: 30, k: 15, tip: "Seed treatment with Rhizobium" },
  "Sunflower": { n: 40, p: 30, k: 20, tip: "Boron at flowering prevents head sterility" },
  "Mustard": { n: 40, p: 20, k: 20, tip: "Sulphur @20kg/acre increases oil content" }
};

// --- Standard fertilizer nutrient content (percentage) ---
const FERTILIZER_NPK = {
  urea: { n: 0.46, p: 0, k: 0 },
  dap: { n: 0.18, p: 0.46, k: 0 },
  mop: { n: 0, p: 0, k: 0.60 }
};

// --- Fertilizer product links and images ---
const FERTILIZER_INFO = {
  urea: {
    name: "Urea (Nitrogen)",
    desc: "Provides Nitrogen for leaf growth and greening.",
    buyLinks: [
      { name: "Buy on BigHaat", url: "https://www.bighaat.com/products/urea" },
      { name: "Buy on IndiaMART", url: "https://www.indiamart.com/proddetail/urea-fertilizer-2850613189288.html" }
    ],
    image: "https://cdn-icons-png.flaticon.com/512/1051/1051302.png" // Fertilizer bag icon
  },
  dap: {
    name: "DAP (Phosphorus)",
    desc: "Provides Phosphorus for root development and flowering.",
    buyLinks: [
      { name: "Buy on BigHaat", url: "https://www.bighaat.com/products/dap" },
      { name: "Buy on IndiaMART", url: "https://www.indiamart.com/proddetail/dap-fertilizer-25975139055.html" }
    ],
    image: "https://cdn-icons-png.flaticon.com/512/1051/1051302.png" // Fertilizer bag icon
  },
  mop: {
    name: "MOP (Potassium)",
    desc: "Provides Potassium for overall plant health and disease resistance.",
    buyLinks: [
      { name: "Buy on BigHaat", url: "https://www.bighaat.com/products/muriate-of-potash" },
      { name: "Buy on IndiaMART", url: "https://www.indiamart.com/proddetail/mangala-mop-fertilizer-13631075597.html" }
    ],
    image: "https://cdn-icons-png.flaticon.com/512/1051/1051302.png" // Fertilizer bag icon
  }
};

// --- Translations (simplified) ---
const T = {
  en: {
    title: "Soil & Nutrition", subtitle: "Smart Fertilizer Advisor",
    heroTitle: "Krishi Poshan Calculator", heroDesc: "Stop wasting money. Select your crop and farm size to get a precise fertilizer prescription.",
    selectCrop: "Select Crop", landSize: "Land Size (Acres)", generate: "Generate Prescription", calculating: "Calculating...",
    waitingTitle: "Ready to help", waitingDesc: "Enter your crop and farm size. We'll calculate exact bags needed.",
    prescription: "Your Prescription", forAcres: "For", bags: "bags", standardBag: "50kg bag",
    estCost: "Estimated Total Cost", basedOn: "Based on standard govt subsidy rates",
    whyMatters: "Why this matters?", whyDesc: "Applying exactly {u} bags of Urea and {d} bags of DAP saves money, prevents soil degradation, and protects groundwater.",
    buyNow: "Buy Now", learnMore: "Learn More", successTip: "🌱 Farmer Tip", costBreakdown: "Cost Breakdown",
    ureaDetail: "Urea (Nitrogen)", dapDetail: "DAP (Phosphorus)", mopDetail: "MOP (Potassium)", total: "Total"
  },
  hi: {
    title: "मिट्टी और पोषण", subtitle: "स्मार्ट उर्वरक सलाहकार",
    heroTitle: "कृषि पोषण कैलकुलेटर", heroDesc: "पैसे बर्बाद करना बंद करें। अपनी फसल और खेत का आकार चुनें, हम सटीक उर्वरक पर्ची देंगे।",
    selectCrop: "फसल चुनें", landSize: "भूमि (एकड़)", generate: "पर्ची बनाएं", calculating: "गणना...",
    waitingTitle: "सहायता के लिए तैयार", waitingDesc: "फसल और खेत का आकार भरें। हम सही बैग निकालेंगे।",
    prescription: "आपकी पर्ची", forAcres: "के लिए", bags: "बैग", standardBag: "50kg बैग",
    estCost: "अनुमानित लागत", basedOn: "मानक सरकारी सब्सिडी दरों के अनुसार",
    whyMatters: "क्यों जरूरी?", whyDesc: "बिल्कुल {u} बैग यूरिया और {d} बैग डीएपी लगाने से पैसा बचता है, मिट्टी सुरक्षित रहती है।",
    buyNow: "अभी खरीदें", learnMore: "और जानें", successTip: "🌱 किसान टिप", costBreakdown: "लागत विवरण",
    ureaDetail: "यूरिया (नाइट्रोजन)", dapDetail: "डीएपी (फास्फोरस)", mopDetail: "एमओपी (पोटाश)", total: "कुल"
  },
  kn: {
    title: "ಮಣ್ಣು ಮತ್ತು ಪೋಷಣೆ", subtitle: "ಸ್ಮಾರ್ಟ್ ಗೊಬ್ಬರ ಸಲಹೆಗಾರ",
    heroTitle: "ಕೃಷಿ ಪೋಷಣ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್", heroDesc: "ಹಣ ವ್ಯರ್ಥ ಮಾಡುವುದನ್ನು ನಿಲ್ಲಿಸಿ. ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಜಮೀನಿನ ಗಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ, ನಾವು ನಿಖರ ಗೊಬ್ಬರದ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ನೀಡುತ್ತೇವೆ.",
    selectCrop: "ಬೆಳೆ ಆಯ್ಕೆ", landSize: "ಭೂಮಿ (ಎಕರೆ)", generate: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ರಚಿಸಿ", calculating: "ಲೆಕ್ಕಾಚಾರ...",
    waitingTitle: "ಸಹಾಯಕ್ಕೆ ಸಿದ್ಧ", waitingDesc: "ಬೆಳೆ ಮತ್ತು ಎಕರೆ ನಮೂದಿಸಿ. ನಾವು ನಿಖರ ಚೀಲಗಳನ್ನು ಲೆಕ್ಕ ಹಾಕುತ್ತೇವೆ.",
    prescription: "ನಿಮ್ಮ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್", forAcres: "ಗಾಗಿ", bags: "ಚೀಲಗಳು", standardBag: "50kg ಚೀಲ",
    estCost: "ಅಂದಾಜು ವೆಚ್ಚ", basedOn: "ಪ್ರಮಾಣಿತ ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿ ದರಗಳ ಆಧಾರದ ಮೇಲೆ",
    whyMatters: "ಇದು ಏಕೆ ಮುಖ್ಯ?", whyDesc: "ನಿಖರವಾಗಿ {u} ಚೀಲ ಯೂರಿಯಾ ಮತ್ತು {d} ಚೀಲ DAP ಬಳಸಿ ಹಣ ಉಳಿಸಿ, ಮಣ್ಣು ಕಾಪಾಡಿ.",
    buyNow: "ಖರೀದಿಸಿ", learnMore: "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ", successTip: "🌱 ರೈತನ ಸಲಹೆ", costBreakdown: "ವೆಚ್ಚದ ವಿವರ",
    ureaDetail: "ಯೂರಿಯಾ (ಸಾರಜನಕ)", dapDetail: "DAP (ರಂಜಕ)", mopDetail: "MOP (ಪೊಟ್ಯಾಶ್)", total: "ಒಟ್ಟು"
  }
};

export default function SoilNutrition() {
  const { language } = useLanguage();
  const t = T[language] || T.en;

  const [crop, setCrop] = useState("Wheat");
  const [acres, setAcres] = useState(1);
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateFertilizer = (e) => {
    e.preventDefault();
    setIsCalculating(true);
    setTimeout(() => {
      const req = CROP_NPK_REQUIREMENTS[crop];
      
      // Calculate required DAP (meets P requirement first)
      const kgDAP = (req.p * acres) / FERTILIZER_NPK.dap.p;
      const nFromDAP = kgDAP * FERTILIZER_NPK.dap.n;
      let remainingN = Math.max(0, (req.n * acres) - nFromDAP);
      const kgUrea = remainingN / FERTILIZER_NPK.urea.n;
      const kgMOP = (req.k * acres) / FERTILIZER_NPK.mop.k;
      
      const ureaBags = Math.max(0, kgUrea / 50);
      const dapBags = Math.max(0, kgDAP / 50);
      const mopBags = Math.max(0, kgMOP / 50);
      
      // Prices based on standard govt subsidy rates (₹ per 50kg bag)
      const ureaPrice = 266;
      const dapPrice = 1350;
      const mopPrice = 1700;
      const totalCost = Math.round((ureaBags * ureaPrice) + (dapBags * dapPrice) + (mopBags * mopPrice));
      
      setResults({
        ureaBags: ureaBags.toFixed(1),
        dapBags: dapBags.toFixed(1),
        mopBags: mopBags.toFixed(1),
        estimatedCost: totalCost,
        cropTip: req.tip
      });
      setIsCalculating(false);
    }, 600);
  };

  // Helper to render a fertilizer card with image and buy links
  const FertilizerCard = ({ type, bags }) => {
    const info = FERTILIZER_INFO[type];
    if (!info) return null;
    
    return (
      <div className="rounded-2xl border border-leaf-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img src={info.image} alt={info.name} className="h-12 w-12 object-contain" />
          <div className="flex-1">
            <h4 className="font-black text-leaf-800">{info.name}</h4>
            <p className="text-xs text-leaf-600">{info.desc}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-leaf-900">{bags} <span className="text-sm font-normal">{t.bags}</span></p>
            <p className="text-[10px] text-leaf-500">{t.standardBag}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {info.buyLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-leaf-50 px-3 py-2 text-center text-xs font-bold text-leaf-700 transition hover:bg-leaf-100"
            >
              {t.buyNow} <ExternalLink size={12} />
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <PageWrapper>
      <Header title={t.title} subtitle={t.subtitle} location="Farm" showBack maxWidth="max-w-5xl" />
      <main className="mx-auto mt-4 max-w-5xl px-5 pb-12 md:px-8">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-leaf-800 to-leaf-700 p-8 text-white shadow-xl md:p-10">
            <div className="absolute right-0 top-0 opacity-10"><TestTube size={200} /></div>
            <div className="relative z-10 md:w-2/3">
              <div className="mb-4 flex w-fit items-center gap-2 rounded-full bg-leaf-500/30 px-3 py-1 text-[10px] font-black uppercase">
                <Leaf size={14} /> Precision Agronomy
              </div>
              <h2 className="mb-3 font-display text-3xl font-black md:text-4xl">{t.heroTitle}</h2>
              <p className="text-base font-medium leading-relaxed text-leaf-100/90">{t.heroDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Input Form Panel */}
            <div className="h-fit rounded-[32px] border border-leaf-100 bg-white p-6 shadow-sm md:p-8">
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-black text-leaf-900">
                <Calculator className="text-leaf-600" /> Farm Details
              </h3>
              <form onSubmit={calculateFertilizer} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-leaf-600">
                    {t.selectCrop}
                  </label>
                  <select 
                    value={crop} 
                    onChange={(e) => setCrop(e.target.value)} 
                    className="w-full rounded-2xl border-2 border-leaf-100 bg-leaf-50 px-4 py-4 font-bold text-leaf-800 focus:border-leaf-500 focus:outline-none"
                  >
                    {Object.keys(CROP_NPK_REQUIREMENTS).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-leaf-600">
                    {t.landSize}
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0.1" 
                    required 
                    value={acres} 
                    onChange={(e) => setAcres(e.target.value)} 
                    className="w-full rounded-2xl border-2 border-leaf-100 bg-leaf-50 py-4 px-4 font-bold text-leaf-800 focus:border-leaf-500 focus:outline-none" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isCalculating} 
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf-700 py-4 font-black text-white shadow-md transition-all hover:bg-leaf-800 active:scale-95 disabled:opacity-70"
                >
                  {isCalculating ? t.calculating : t.generate}
                </button>
              </form>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {!results && !isCalculating && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex min-h-[200px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-leaf-200 bg-white p-8 text-center md:p-12"
                  >
                    <TestTube size={48} className="mb-4 text-leaf-300" />
                    <h3 className="font-display text-xl font-black text-leaf-500">{t.waitingTitle}</h3>
                    <p className="mx-auto mt-2 max-w-sm font-medium text-leaf-600">{t.waitingDesc}</p>
                  </motion.div>
                )}

                {results && !isCalculating && (
                  <motion.div 
                    key="results" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="space-y-5"
                  >
                    {/* Main Prescription Card */}
                    <div className="rounded-[32px] border border-leaf-200 bg-white p-6 shadow-sm md:p-8">
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-leaf-100 pb-4">
                        <div>
                          <h3 className="font-display text-2xl font-black text-leaf-900">{t.prescription}</h3>
                          <p className="font-bold text-leaf-500">{t.forAcres} {acres} Acres: {crop}</p>
                        </div>
                        <div className="rounded-2xl bg-leaf-100 p-3 text-leaf-600">
                          <CheckCircle2 size={24} />
                        </div>
                      </div>

                      {/* Fertilizer Cards with Images and Buy Links */}
                      <div className="space-y-4">
                        <FertilizerCard type="urea" bags={results.ureaBags} />
                        <FertilizerCard type="dap" bags={results.dapBags} />
                        <FertilizerCard type="mop" bags={results.mopBags} />
                      </div>

                      {/* Cost Breakdown */}
                      <div className="mt-6 rounded-2xl bg-leaf-50 p-5">
                        <div className="flex justify-between text-sm">
                          <span>{t.ureaDetail}</span>
                          <span>₹{Math.round(results.ureaBags * 266)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{t.dapDetail}</span>
                          <span>₹{Math.round(results.dapBags * 1350)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{t.mopDetail}</span>
                          <span>₹{Math.round(results.mopBags * 1700)}</span>
                        </div>
                        <div className="mt-2 flex justify-between border-t border-leaf-200 pt-2 font-black">
                          <span>{t.total}</span>
                          <span>₹{results.estimatedCost}</span>
                        </div>
                      </div>
                    </div>

                    {/* Farmer Tip */}
                    <div className="rounded-2xl border border-sun-200 bg-sun-50 p-5">
                      <h4 className="mb-2 font-display text-lg font-black text-sun-800">{t.successTip}</h4>
                      <p className="text-sm font-medium text-sun-700">{results.cropTip}</p>
                    </div>

                    {/* Why This Matters */}
                    <div className="rounded-2xl bg-blue-50 p-5 text-sm">
                      <AlertTriangle size={18} className="mr-2 inline text-blue-700" />
                      {t.whyDesc.replace('{u}', results.ureaBags).replace('{d}', results.dapBags)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  );
}