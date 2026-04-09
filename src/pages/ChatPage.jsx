import { Mic, SendHorizontal, Sparkles, Image as ImageIcon, Camera, User, Bot, Paperclip, ChevronDown, MoreVertical, Globe } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../context/LanguageContext";
import { getCurrentTimeLabel } from "../utils/helpers";
import { motion, AnimatePresence } from "framer-motion";

const T = {
  en: {
    title: "Kisaan AI", subtitle: "Advanced Agronomic Intelligence",
    initialMessage: "Namaste! I am Kisaan AI. How can I assist your farming operations today?",
    placeholder: "Ask about crops, weather, or mandi prices...", 
    voiceInput: "Voice Control", attach: "Upload Data",
    suggested: "RECOMMENDED QUERIES",
    suggestions: [
      { id: 'weather', label: "Rain forecast for Belgaum", icon: '🌧️' },
      { id: 'market', label: "Wheat price trends", icon: '📈' },
      { id: 'disease', label: "Identify leaf spots", icon: '🍃' }
    ],
    responses: {
      weather: "Atmospheric data indicates a 20% precipitation probability for Belgaum this evening. Soil moisture levels are optimal for irrigation management.",
      market: "Domestic Wheat indices show a 2% bullish trend. Current modal price at Belgaum Mandi is ₹2,450/qtl. I recommend holding stock for 48 hours for maximum ROI.",
      disease: "Analyzing visual symptoms... This pattern suggests initial stages of Septoria leaf spot. I prescribe an application of Propi-conazole. Would you like to view local suppliers?",
      fallback: "I am analyzing your query with our precision agri-models. Could you specify the crop variety for a more accurate diagnosis?"
    }
  },
  hi: {
    title: "किसान AI", subtitle: "उन्नत कृषि इंटेलिजेंस",
    initialMessage: "नमस्ते! मैं किसान AI हूँ। आज मैं आपकी खेती में कैसे मदद कर सकता हूँ?",
    placeholder: "फसल, मौसम या मंडी भाव के बारे में पूछें...",
    voiceInput: "वॉयस कंट्रोल", attach: "डेटा अपलोड करें",
    suggested: "अनुशंसित प्रश्न",
    suggestions: [
      { id: 'weather', label: "बेलगाम में बारिश का पूर्वानुमान", icon: '🌧️' },
      { id: 'market', label: "गेहूं के भाव का रुझान", icon: '📈' },
      { id: 'disease', label: "पत्तों के धब्बों की पहचान", icon: '🍃' }
    ],
    responses: {
      weather: "वायुमंडलीय डेटा आज शाम बेलगाम के लिए 20% बारिश की संभावना दर्शाता है। सिंचाई प्रबंधन के लिए मिट्टी की नमी का स्तर अनुकूल है।",
      market: "घरेलू गेहूं सूचकांक 2% का सुधार दर्शाते हैं। बेलगाम मंडी में वर्तमान मॉडल मूल्य ₹2,450/क्विंटल है। मेरा सुझाव है कि अधिकतम लाभ के लिए 48 घंटे तक स्टॉक रखें।",
      disease: "लक्षणों का विश्लेषण कर रहा हूँ... यह पैटर्न सेप्टोरिया लीफ स्पॉट के शुरुआती चरणों का सुझाव देता है। मैं प्रोपी-कोनाज़ोल लगाने की सलाह देता हूँ। क्या आप स्थानीय आपूर्तिकर्ताओं को देखना चाहेंगे?",
      fallback: "मैं अपनी कृषि-मॉडलों के साथ आपके प्रश्न का विश्लेषण कर रहा हूँ। क्या आप अधिक सटीक निदान के लिए फसल की किस्म बता सकते हैं?"
    }
  },
  kn: {
    title: "ಕಿಸಾನ್ AI", subtitle: "ಸುಧಾರಿತ ಕೃಷಿ ಬುದ್ಧಿವಂತಿಕೆ",
    initialMessage: "ನಮಸ್ತೆ! ನಾನು ಕಿಸಾನ್ AI. ಇಂದು ನಿಮ್ಮ ಕೃಷಿ ಕಾರ್ಯಾಚರಣೆಗಳಿಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    placeholder: "ಬೆಳೆಗಳು, ಹವಾಮಾನ ಅಥವಾ ಮಂಡಿ ಬೆಲೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ...", 
    voiceInput: "ಧ್ವನಿ ನಿಯಂತ್ರಣ", attach: "ಡೇಟಾ ಅಪ್‌ಲೋಡ್",
    suggested: "ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಶ್ನೆಗಳು",
    suggestions: [
      { id: 'weather', label: "ಬೆಳಗಾವಿ ಮಳೆ ಮುನ್ಸೂಚನೆ", icon: '🌧️' },
      { id: 'market', label: "ಗೋಧಿ ಬೆಲೆ ಪ್ರವೃತ್ತಿ", icon: '📈' },
      { id: 'disease', label: "ಎಲೆ ಚುಕ್ಕೆ ಗುರುತಿಸಿ", icon: '🍃' }
    ],
    responses: {
      weather: "ಬೆಳಗಾವಿಯಲ್ಲಿ ಇಂದು ಸಂಜೆ 20% ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ ಎಂದು ವಾಯುಮಂಡಲದ ದತ್ತಾಂಶ ಸೂಚಿಸುತ್ತದೆ. ನೀರಾವರಿ ನಿರ್ವಹಣೆಗೆ ಮಣ್ಣಿನ ತೇವಾಂಶ ಉತ್ತಮವಾಗಿದೆ.",
      market: "ದೇಶೀಯ ಗೋಧಿ ಬೆಲೆಯಲ್ಲಿ 2% ಏರಿಕೆ ಕಂಡುಬಂದಿದೆ. ಬೆಳಗಾವಿ ಮಂಡಿಯಲ್ಲಿ ಇಂದಿನ ಮಾದರಿ ಬೆಲೆ ₹2,450/ಕ್ವಿಂಟಾಲ್ ಆಗಿದೆ. ಗರಿಷ್ಠ ಲಾಭಕ್ಕಾಗಿ 48 ಗಂಟೆಗಳ ಕಾಲ ಸ್ಟಾಕ್ ಇರಿಸಿಕೊಳ್ಳಲು ನಾನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ.",
      disease: "ಲಕ್ಷಣಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ... ಇದು ಸೆಪ್ಟೋರಿಯಾ ಎಲೆ ಚುಕ್ಕೆ ರೋಗದ ಆರಂಭಿಕ ಹಂತಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ. ನಾನು ಪ್ರೊಪಿ-ಕೊನಜೋಲ್ ಬಳಸಲು ಸೂಚಿಸುತ್ತೇನೆ. ನೀವು ಸ್ಥಳೀಯ ಪೂರೈಕೆದಾರರನ್ನು ನೋಡಲು ಬಯಸುವಿರಾ?",
      fallback: "ನಮ್ಮ ನಿಖರ ಕೃಷಿ ಮಾದರಿಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಾನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇನೆ. ನಿಖರವಾದ ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ನೀವು ಬೆಳೆಯ ತಳಿಯನ್ನು ತಿಳಿಸಬಹುದೇ?"
    }
  }
};

export default function ChatPage() {
  const { language, setLanguage, content } = useLanguage();
  const t = T[language] || T.en;
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Re-initialize greeting when language is switched
  useEffect(() => {
    setMessages([
      { 
        id: `INIT-${language}`, 
        sender: "ai", 
        text: t.initialMessage, 
        time: getCurrentTimeLabel(content.locale) 
      }
    ]);
  }, [language]); // Depend on language specifically

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text, responseKey = null) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const userTime = getCurrentTimeLabel(content.locale);
    setMessages(prev => [...prev, { id: `USER-${Date.now()}`, sender: "user", text: cleanText, time: userTime }]);
    setDraft("");

    setIsTyping(true);
    setTimeout(() => {
      const aiReply = responseKey ? t.responses[responseKey] : t.responses.fallback;
      setMessages(prev => [...prev, { id: `AI-${Date.now()}`, sender: "ai", text: aiReply, time: getCurrentTimeLabel(content.locale) }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <div className="mx-auto max-w-4xl flex flex-col min-h-screen">
        
        {/* Advanced Header with Language Switcher */}
        <div className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 px-6 py-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                       <Sparkles size={24} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
                 </div>
                 <div>
                    <h1 className="text-xl font-black text-slate-900 leading-none">{t.title}</h1>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5">{t.subtitle}</p>
                 </div>
              </div>

              <div className="flex items-center gap-2 relative">
                 {/* QUICK LANGUAGE SWITCHER */}
                 <button 
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 transition-all hover:bg-emerald-100 active:scale-95"
                 >
                    <Globe size={16} className="text-emerald-700" />
                    <span className="text-[11px] font-black text-emerald-800 uppercase">{language}</span>
                    <ChevronDown size={14} className={`text-emerald-700 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
                 </button>

                 <AnimatePresence>
                   {showLangMenu && (
                     <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-14 right-0 bg-white rounded-2xl shadow-2xl border border-emerald-50 p-2 min-w-[120px] z-[70]"
                     >
                       <LangBtn active={language === 'en'} onClick={() => { setLanguage('en'); setShowLangMenu(false); }} label="English" />
                       <LangBtn active={language === 'hi'} onClick={() => { setLanguage('hi'); setShowLangMenu(false); }} label="हिन्दी" />
                       <LangBtn active={language === 'kn'} onClick={() => { setLanguage('kn'); setShowLangMenu(false); }} label="ಕನ್ನಡ" />
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <button className="p-3 text-slate-400 hover:text-slate-600 transition-colors md:flex hidden"><MoreVertical size={20} /></button>
              </div>
           </div>
        </div>

        {/* Chat Canvas */}
        <div className="flex-1 px-4 py-8 overflow-y-auto space-y-8 scroll-smooth pb-44">
           <AnimatePresence>
              {messages.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${m.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-emerald-600 border border-emerald-50'}`}>
                    {m.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  
                  <div className={`flex flex-col max-w-[80%] ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-5 rounded-[2rem] text-sm font-semibold leading-relaxed shadow-[0_10px_30px_rgba(0,0,0,0.03)] border ${m.sender === 'user' 
                        ? 'bg-emerald-700 text-white border-emerald-600 rounded-tr-none' 
                        : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                      }`}>
                      {m.text}
                    </div>
                    <span className="mt-2 text-[10px] font-black text-slate-300 uppercase tracking-widest px-2">{m.time}</span>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                   <div className="shrink-0 h-10 w-10 rounded-xl bg-white border border-emerald-50 text-emerald-600 flex items-center justify-center">
                     <Bot size={18} />
                   </div>
                   <div className="bg-white border border-slate-100 px-6 py-4 rounded-[2rem] rounded-tl-none flex gap-1.5 shadow-sm">
                      <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" />
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
           <div ref={messagesEndRef} />
        </div>

        {/* Global Suggestions Section */}
        <div className="fixed bottom-24 left-0 right-0 px-4 md:px-8 pointer-events-none">
           <div className="mx-auto max-w-4xl flex flex-col gap-3 pointer-events-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{t.suggested}</p>
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-4">
                 <div className="shrink-0 bg-emerald-700 text-white p-3 rounded-2xl shadow-lg shadow-emerald-200">
                    <Sparkles size={16} />
                 </div>
                 <div className="flex gap-2">
                    {t.suggestions.map((s) => (
                      <button 
                       key={s.id} 
                       onClick={() => sendMessage(s.label, s.id)}
                       className="whitespace-nowrap bg-white/80 backdrop-blur-md border border-white hover:bg-white px-5 py-3 rounded-2xl text-[11px] font-black text-slate-700 shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                      >
                        <span>{s.icon}</span>
                        <span>{s.label.toUpperCase()}</span>
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Intelligent Command Bar */}
        <div className="fixed bottom-6 left-0 right-0 px-4 md:px-8">
           <form 
            className="mx-auto max-w-4xl bg-white rounded-[2.5rem] border border-emerald-100 p-2 pl-4 shadow-2xl shadow-emerald-900/10 flex items-center gap-2 pr-2"
            onSubmit={(e) => { e.preventDefault(); sendMessage(draft); }}
           >
              <div className="flex gap-1">
                 <button type="button" aria-label={t.attach} className="h-12 w-12 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"><Camera size={20} /></button>
                 <button type="button" className="h-12 w-12 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all md:flex hidden"><Paperclip size={20} /></button>
              </div>
              
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 bg-transparent py-4 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300 px-2"
              />

              <div className="flex items-center gap-1">
                 <button type="button" aria-label={t.voiceInput} className="h-12 w-12 flex items-center justify-center bg-slate-50 text-slate-500 rounded-full hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                    <Mic size={20} />
                 </button>
                 <button 
                  type="submit"
                  disabled={!draft.trim() || isTyping}
                  className="h-14 w-14 bg-emerald-700 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-200 hover:bg-emerald-800 transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
                 >
                    <SendHorizontal size={24} />
                 </button>
              </div>
           </form>
        </div>

      </div>
    </PageWrapper>
  );
}

function LangBtn({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${active ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
    >
      {label}
    </button>
  );
}