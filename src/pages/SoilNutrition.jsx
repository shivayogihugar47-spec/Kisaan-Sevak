import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Calculator, CheckCircle2, Leaf, ShoppingBag, TestTube } from 'lucide-react';
import React, { useState } from 'react';
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../context/LanguageContext";

const CROP_NPK_REQUIREMENTS = {
  "Wheat": { n: 48, p: 24, k: 16 },
  "Rice": { n: 40, p: 24, k: 16 },
  "Cotton": { n: 48, p: 24, k: 24 },
  "Sugarcane": { n: 100, p: 34, k: 34 },
  "Soybean": { n: 12, p: 32, k: 16 },
  "Onion": { n: 40, p: 20, k: 40 }
};

const T = {
  en: {
    title: "Soil & Nutrition", subtitle: "Precision fertilizer calculator",
    heroTitle: "Krishi Poshan Calculator", heroDesc: "Stop wasting money on excess Urea. Select your crop and farm size, and we will calculate the exact number of fertilizer bags you need based on scientific N-P-K ratios.",
    enterDetails: "Enter Details", selectCrop: "Select Crop", landSize: "Land Size (Acres)",
    generate: "Generate Prescription", calculating: "Calculating...",
    waitingTitle: "Waiting for Input", waitingDesc: "Enter your crop and land size to generate a scientific fertilizer prescription.",
    prescription: "Your Prescription", forAcres: "For", bags: "Bags", standardBag: "Standard 50kg Bag",
    estCost: "Estimated Total Cost", basedOn: "Based on standard govt subsidy rates",
    whyMatters: "Why this matters?", whyDesc: "Applying too much Urea burns the soil and washes into local water supplies. By applying exactly {u} bags of Urea and {d} bags of DAP, you ensure your crop gets exact nutrients without wasting money."
  },
  hi: {
    title: "मिट्टी और पोषण", subtitle: "सटीक उर्वरक कैलकुलेटर",
    heroTitle: "कृषि पोषण कैलकुलेटर", heroDesc: "अतिरिक्त यूरिया पर पैसा बर्बाद करना बंद करें। अपनी फसल और खेत का आकार चुनें, और हम वैज्ञानिक N-P-K अनुपात के आधार पर आवश्यक उर्वरक बैग की सटीक संख्या की गणना करेंगे।",
    enterDetails: "विवरण दर्ज करें", selectCrop: "फसल चुनें", landSize: "भूमि का आकार (एकड़)",
    generate: "पर्ची बनाएं", calculating: "गणना कर रहा है...",
    waitingTitle: "इनपुट की प्रतीक्षा है", waitingDesc: "वैज्ञानिक उर्वरक पर्ची बनाने के लिए अपनी फसल और भूमि का आकार दर्ज करें।",
    prescription: "आपकी पर्ची", forAcres: "के लिए", bags: "बैग", standardBag: "मानक 50kg बैग",
    estCost: "अनुमानित कुल लागत", basedOn: "मानक सरकारी सब्सिडी दरों के आधार पर",
    whyMatters: "यह क्यों मायने रखता है?", whyDesc: "बहुत अधिक यूरिया डालने से मिट्टी जल जाती है। ठीक {u} बैग यूरिया और {d} बैग डीएपी डालकर, आप सुनिश्चित करते हैं कि आपकी फसल को बिना पैसे बर्बाद किए सटीक पोषक तत्व मिलें।"
  },
  kn: {
    title: "ಮಣ್ಣು ಮತ್ತು ಪೋಷಣೆ", subtitle: "ನಿಖರವಾದ ರಸಗೊಬ್ಬರ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    heroTitle: "ಕೃಷಿ ಪೋಷಣ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್", heroDesc: "ಹೆಚ್ಚುವರಿ ಯೂರಿಯಾ ಮೇಲೆ ಹಣವನ್ನು ವ್ಯರ್ಥ ಮಾಡುವುದನ್ನು ನಿಲ್ಲಿಸಿ. ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಜಮೀನಿನ ಗಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ, ಮತ್ತು ನಾವು ವೈಜ್ಞಾನಿಕ N-P-K ಅನುಪಾತಗಳ ಆಧಾರದ ಮೇಲೆ ನಿಖರವಾದ ರಸಗೊಬ್ಬರ ಚೀಲಗಳನ್ನು ಲೆಕ್ಕ ಹಾಕುತ್ತೇವೆ.",
    enterDetails: "ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ", selectCrop: "ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", landSize: "ಭೂಮಿಯ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)",
    generate: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ರಚಿಸಿ", calculating: "ಲೆಕ್ಕಾಚಾರ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    waitingTitle: "ಇನ್‌ಪುಟ್‌ಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ", waitingDesc: "ವೈಜ್ಞಾನಿಕ ರಸಗೊಬ್ಬರ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ರಚಿಸಲು ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಭೂಮಿಯ ಗಾತ್ರವನ್ನು ನಮೂದಿಸಿ.",
    prescription: "ನಿಮ್ಮ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್", forAcres: "ಗಾಗಿ", bags: "ಚೀಲಗಳು", standardBag: "ಪ್ರಮಾಣಿತ 50kg ಚೀಲ",
    estCost: "ಅಂದಾಜು ಒಟ್ಟು ವೆಚ್ಚ", basedOn: "ಪ್ರಮಾಣಿತ ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿ ದರಗಳ ಆಧಾರದ ಮೇಲೆ",
    whyMatters: "ಇದು ಏಕೆ ಮುಖ್ಯ?", whyDesc: "ಹೆಚ್ಚು ಯೂರಿಯಾವನ್ನು ಹಾಕುವುದರಿಂದ ಮಣ್ಣು ಸುಡುತ್ತದೆ. ನಿಖರವಾಗಿ {u} ಚೀಲ ಯೂರಿಯಾ ಮತ್ತು {d} ಚೀಲ DAP ಹಾಕುವ ಮೂಲಕ, ಹಣವನ್ನು ವ್ಯರ್ಥ ಮಾಡದೆ ನಿಮ್ಮ ಬೆಳೆಗೆ ನಿಖರವಾದ ಪೋಷಕಾಂಶಗಳು ಸಿಗುತ್ತವೆ ಎಂದು ನೀವು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳುತ್ತೀರಿ."
  }
};

export default function SoilNutrition() {
  const { language, content } = useLanguage();
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
      const kgDAP = (req.p * acres) / 0.46;
      const kgUrea = Math.max(0, (req.n * acres) - (kgDAP * 0.18)) / 0.46;
      const kgMOP = (req.k * acres) / 0.60;
      setResults({
        dapBags: (kgDAP / 50).toFixed(1),
        ureaBags: (kgUrea / 50).toFixed(1),
        mopBags: (kgMOP / 50).toFixed(1),
        estimatedCost: Math.round(((kgUrea / 50) * 266) + ((kgDAP / 50) * 1350) + ((kgMOP / 50) * 1700))
      });
      setIsCalculating(false);
    }, 800);
  };

  return (
    <PageWrapper>
      <Header title={t.title} subtitle={t.subtitle} location={content.locationLabel} showBack maxWidth="max-w-5xl" />
      <main className="mx-auto mt-4 max-w-5xl px-5 pb-12 md:px-8">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[32px] bg-leaf-900 p-8 text-white shadow-xl md:p-10">
            <div className="absolute right-0 top-0 opacity-10 md:transform md:-translate-y-1/4 md:translate-x-1/4">
              <TestTube size={200} />
            </div>
            <div className="relative z-10 md:w-2/3">
              <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-leaf-400/20 bg-leaf-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-leaf-300">
                <Leaf size={14} /> Precision Agronomy
              </div>
              <h2 className="mb-3 font-display text-3xl font-black md:text-4xl">{t.heroTitle}</h2>
              <p className="text-base font-medium leading-relaxed text-leaf-100/90 md:text-lg">{t.heroDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-fit rounded-[32px] border border-leaf-100 bg-white p-6 shadow-sm md:p-8 lg:col-span-1">
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-black text-leaf-900">
                <Calculator className="text-leaf-600" /> {t.enterDetails}
              </h3>
              <form onSubmit={calculateFertilizer} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-leaf-500">{t.selectCrop}</label>
                  <select value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full rounded-2xl border-2 border-leaf-100 bg-leaf-50 px-4 py-4 font-bold text-leaf-800 transition-colors focus:border-leaf-500 focus:outline-none">
                    {Object.keys(CROP_NPK_REQUIREMENTS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-leaf-500">{t.landSize}</label>
                  <input type="number" step="0.1" min="0.1" required value={acres} onChange={(e) => setAcres(e.target.value)} className="w-full rounded-2xl border-2 border-leaf-100 bg-leaf-50 py-4 px-4 font-bold text-leaf-800 transition-colors focus:border-leaf-500 focus:outline-none" />
                </div>
                <button type="submit" disabled={isCalculating} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf-700 py-4 font-black text-white shadow-md transition-all hover:bg-leaf-800 active:scale-95 disabled:opacity-70">
                  {isCalculating ? t.calculating : t.generate}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {!results && !isCalculating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[350px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-leaf-200 bg-white p-8 text-center md:p-12 lg:h-full">
                    <TestTube size={48} className="mb-4 text-leaf-200" />
                    <h3 className="font-display text-xl font-black text-leaf-400">{t.waitingTitle}</h3>
                    <p className="mx-auto mt-2 max-w-sm font-medium text-leaf-500">{t.waitingDesc}</p>
                  </motion.div>
                )}

                {results && !isCalculating && (
                  <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="rounded-[32px] border border-leaf-200 bg-white p-6 shadow-sm md:p-8">
                      <div className="mb-6 flex items-center justify-between border-b border-leaf-50 pb-4">
                        <div>
                          <h3 className="font-display text-2xl font-black text-leaf-900">{t.prescription}</h3>
                          <p className="mt-1 font-bold text-leaf-500">{t.forAcres} {acres} Acres: {crop}</p>
                        </div>
                        <div className="rounded-2xl bg-leaf-100 p-3 text-leaf-600"><CheckCircle2 size={24} /></div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-leaf-100 bg-leaf-50 p-5 text-center">
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-leaf-500">Urea (Nitrogen)</p>
                          <h4 className="font-display text-3xl font-black text-leaf-900">{results.ureaBags} <span className="text-sm">{t.bags}</span></h4>
                          <p className="mt-2 text-[10px] font-bold text-leaf-400">{t.standardBag}</p>
                        </div>
                        <div className="rounded-2xl border border-leaf-100 bg-leaf-50 p-5 text-center">
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-leaf-500">DAP (Phosphorus)</p>
                          <h4 className="font-display text-3xl font-black text-leaf-900">{results.dapBags} <span className="text-sm">{t.bags}</span></h4>
                          <p className="mt-2 text-[10px] font-bold text-leaf-400">{t.standardBag}</p>
                        </div>
                        <div className="rounded-2xl border border-leaf-100 bg-leaf-50 p-5 text-center">
                          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-leaf-500">MOP (Potassium)</p>
                          <h4 className="font-display text-3xl font-black text-leaf-900">{results.mopBags} <span className="text-sm">{t.bags}</span></h4>
                          <p className="mt-2 text-[10px] font-bold text-leaf-400">{t.standardBag}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between rounded-2xl border border-leaf-200 bg-leaf-50 p-5">
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="text-leaf-600" size={24} />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-leaf-700">{t.estCost}</p>
                            <p className="text-xs font-bold text-leaf-500 md:text-sm">{t.basedOn}</p>
                          </div>
                        </div>
                        <h3 className="font-display text-2xl font-black text-leaf-800 md:text-3xl">₹{results.estimatedCost}</h3>
                      </div>
                    </div>

                    <div className="rounded-[32px] border border-sun-200 bg-sun-50 p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <AlertTriangle className="text-sun-600" size={20} />
                        <h4 className="font-display text-lg font-black text-sun-900">{t.whyMatters}</h4>
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-sun-800">
                        {t.whyDesc.replace('{u}', results.ureaBags).replace('{d}', results.dapBags)}
                      </p>
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