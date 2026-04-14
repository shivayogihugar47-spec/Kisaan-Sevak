import { Mic, SendHorizontal, Sparkles, User, Bot, ChevronDown, MoreVertical, Globe, Copy, Trash2, Heart, Download, RotateCcw, Settings, MessageCircle, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import FormattedMessage from "../components/FormattedMessage";
import { useLanguage } from "../context/LanguageContext";
import { getCurrentTimeLabel } from "../utils/helpers";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatRequest } from "../services/chatservice";

const T = {
  en: {
    title: "Kisaan AI", 
    subtitle: "Your Personal Farming Advisor",
    initialMessage: "Namaste! 🌾 I'm your Kisaan AI - your personal farming advisor. Ask me about crops, weather, soil, market prices, or any farming challenge. I'm here to help you succeed!",
    placeholder: "What farming challenge can I help you with today?", 
    voiceInput: "Voice Input",
    suggested: "RECOMMENDED QUERIES",
    suggestions: [
      { id: 'weather', label: "Rain forecast for Belgaum", icon: '🌧️' },
      { id: 'market', label: "Wheat price trends", icon: '📈' },
      { id: 'disease', label: "Identify leaf spots", icon: '🍃' }
    ],
    clearChat: "Clear Chat",
    copy: "Copy",
    delete: "Delete",
    favorite: "Favorite",
    downloadChat: "Download",
    resetChat: "Reset Conversation",
    messageCount: "Messages",
    copied: "Copied!",
    responses: {
      fallback: "I am analyzing your query with our precision agri-models. Could you specify the crop variety for a more accurate diagnosis?"
    }
  },
  hi: {
    title: "किसान AI", 
    subtitle: "आपका व्यक्तिगत खेती सलाहकार",
    initialMessage: "नमस्ते! 🌾 मैं आपका किसान AI हूँ - आपका व्यक्तिगत खेती सलाहकार। मुझसे फसलें, मौसम, मिट्टी, बाजार दर, या कोई भी खेती की समस्या पूछें। आपकी सफलता के लिए मैं यहाँ हूँ!",
    placeholder: "आज कौन सी खेती की चुनौती है? मुझसे पूछें...",
    voiceInput: "आवाज से पूछें", 
    suggested: "अनुशंसित प्रश्न",
    suggestions: [
      { id: 'weather', label: "बेलगाम में बारिश का पूर्वानुमान", icon: '🌧️' },
      { id: 'market', label: "गेहूं के भाव का रुझान", icon: '📈' },
      { id: 'disease', label: "पत्तों के धब्बों की पहचान", icon: '🍃' }
    ],
    clearChat: "चैट साफ़ करें",
    copy: "कॉपी",
    delete: "हटाएं",
    favorite: "पसंदीदा",
    downloadChat: "डाउनलोड",
    resetChat: "रीसेट करें",
    messageCount: "संदेश",
    copied: "कॉपी किया!",
    responses: {
      fallback: "मैं अपनी कृषि-मॉडलों के साथ आपके प्रश्न का विश्लेषण कर रहा हूँ। क्या आप अधिक सटीक निदान के लिए फसल की किस्म बता सकते हैं?"
    }
  },
  kn: {
    title: "ಕಿಸಾನ್ AI", 
    subtitle: "ನಿಮ್ಮ ವ್ಯಕ್ತಿಗತ ಕೃಷಿ ಸಲಹಾಕಾರ",
    initialMessage: "ನಮಸ್ತೆ! 🌾 ನಾನು ನಿಮ್ಮ ಕಿಸಾನ್ AI - ನಿಮ್ಮ ವ್ಯಕ್ತಿಗತ ಕೃಷಿ ಸಲಹಾಕಾರ. ನನ್ನನ್ನು ಬೆಳೆ, ಹವಾಮಾನ, ಮಣ್ಣು, ಬೆಲೆ ಅಥವಾ ಯಾವುದೇ ಕೃಷಿ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ಕೇಳಿ. ನಿಮ್ಮ ಯಶಸ್ಸಿನಿ ಗುರಿ!",
    placeholder: "ಇಂದು ಯಾವ ಕೃಷಿ ಸವಾಲು? ನನ್ನನ್ನು ಕೇಳಿ...", 
    voiceInput: "ಧ್ವನಿ ಇನ್‌ಪುಟ್", 
    suggested: "ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಶ್ನೆಗಳು",
    suggestions: [
      { id: 'weather', label: "ಬೆಳಗಾವಿ ಮಳೆ ಮುನ್ಸೂಚನೆ", icon: '🌧️' },
      { id: 'market', label: "ಗೋಧಿ ಬೆಲೆ ಪ್ರವೃತ್ತಿ", icon: '📈' },
      { id: 'disease', label: "ಎಲೆ ಚುಕ್ಕೆ ಗುರುತಿಸಿ", icon: '🍃' }
    ],
    clearChat: "ಚ್ಯಾಟ ತೆರವುಗೊಳಿಸಿ",
    copy: "ನಕಲಿ",
    delete: "ಅಳಿಸಿ",
    favorite: "ಮೆಚ್ಚಿತವನ್ನು",
    downloadChat: "ಡೌನ್‌ಲೋಡ್",
    resetChat: "ಮರುಹೊಂದಿಸಿ",
    messageCount: "ಸಂದೇಶಗಳು",
    copied: "ನಕಲಿ ಮಾಡಲಾಗಿದೆ!",
    responses: {
      fallback: "ನಮ್ಮ ನಿಖರ ಕೃಷಿ ಮಾದರಿಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಾನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇನೆ. ನಿಖರವಾದ ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ನೀವು ಬೆಳೆಯ ತಳಿಯನ್ನು ತಿಳಿಸಬಹುದೇ?"
    }
  }
};

export default function ChatPage() {
  const { language, setLanguage, content } = useLanguage();
  const t = T[language] || T.en;
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setDraft(prev => (prev + ' ' + transcript).trim());
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [language]);

  // Re-initialize greeting when language is switched
  useEffect(() => {
    setMessages([
      { 
        id: `INIT-${language}`, 
        sender: "ai", 
        text: t.initialMessage, 
        time: getCurrentTimeLabel(content?.locale || 'en-IN') 
      }
    ]);
  }, [language]); // Depend on language specifically

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported in your browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const clearChat = () => {
    if (window.confirm(language === 'en' ? 'Clear all messages?' : language === 'hi' ? 'सभी संदेश हटाएं?' : 'ಎಲ್ಲಾ ಸಂದೇಶಗಳನ್ನು ಅಳಿಸಿ?')) {
      setMessages([{
        id: `INIT-${language}`,
        sender: "ai",
        text: t.initialMessage,
        time: getCurrentTimeLabel(content?.locale || 'en-IN')
      }]);
      setFavorites([]);
    }
  };

  const downloadChat = () => {
    const chatContent = messages.map(m => `[${m.time}] ${m.sender.toUpperCase()}: ${m.text.replace(/\n/g, ' ')}`).join('\n\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(chatContent));
    element.setAttribute('download', `kisaan-ai-chat-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const sendMessage = async (text) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const userTime = getCurrentTimeLabel(content?.locale || 'en-IN');
    setMessages(prev => [...prev, { id: `USER-${Date.now()}`, sender: "user", text: cleanText, time: userTime }]);
    setDraft("");

    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));
      
      const systemPrompts = {
         en: "You MUST respond ONLY with 4-5 bullet points. Format: - Point 1\n- Point 2\n- Point 3. NO other text. NO paragraphs. NO sentences. ONLY bullet points with dashes. Each bullet is one short line. CRITICAL: Start with dash (-) for every line. Stop after 5 bullets.",
         hi: "आप ONLY 4-5 बुलेट्स में देंगे। फॉर्मेट: - बुलेट 1\n- बुलेट 2\n- बुलेट 3। कुछ और नहीं। ONLY डैश से शुरू करें। हर लाइन एक छोटी। 5 के बाद रोकें।",
         kn: "ನೀವು ONLY 4-5 ಬುಲೆಟ್ಚಲಿ ಉತ್ತರ ಕೊಡಿ। ಫಾರ್ಮೆಟ್: - ಬುಲೆಟ್ 1\n- ಬುಲೆಟ್ 2\n- ಬುಲೆಟ್ 3। ಬೇರೆ ಕಾಣ್ಠ ಇಲ್ಲ। ONLY ಡ್ಯಾಶ್ ಪ್ರಾರಂಭ ಮಾಡಿ।"
      }[language] || "RESPOND ONLY: 4-5 bullet points. Format: - Point. NO other text.";

      const apiMessages = [
        { role: 'system', content: systemPrompts[language] },
        ...history,
        { role: 'user', content: cleanText }
      ];

      const res = await sendChatRequest({ messages: apiMessages });
      const aiReply = res.reply;
      setMessages(prev => [...prev, { id: `AI-${Date.now()}`, sender: "ai", text: aiReply, time: getCurrentTimeLabel(content?.locale || 'en-IN') }]);
    } catch (error) {
      console.error(error);
      const fallback = "I am currently unable to process requests. Please make sure the Nvidia API is working correctly or try again later.";
      setMessages(prev => [...prev, { id: `AI-${Date.now()}`, sender: "ai", text: fallback, time: getCurrentTimeLabel(content?.locale || 'en-IN') }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <PageWrapper className="bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className="flex flex-col min-h-screen w-full">
        
        {/* Premium Header */}
        <div className="sticky top-0 z-[60] bg-white/90 backdrop-blur-2xl border-b border-emerald-100 px-4 sm:px-8 py-3 sm:py-4 shadow-sm">
           <div className="mx-auto max-w-5xl flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                 <div className="relative shrink-0">
                    <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-300/50">
                       <Sparkles size={24} />
                    </div>
                    <motion.div className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                 </div>
                 <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate">{t.title}</h1>
                    <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t.subtitle}</p>
                 </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 sm:gap-2 shrink-0">
                 {/* Stats */}
                 <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 shrink-0">
                    <MessageCircle size={14} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-emerald-700 shrink-0">{messages.length - 1}</span>
                 </div>

                 {/* Language Switcher */}
                 <button 
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-emerald-700/10 rounded-xl border border-emerald-200 transition-all hover:bg-emerald-700/20 active:scale-95 text-emerald-700 shrink-0 whitespace-nowrap"
                 >
                    <Globe size={16} className="hidden sm:block shrink-0" />
                    <span className="text-[10px] sm:text-xs font-black uppercase">{language}</span>
                 </button>

                 <AnimatePresence>
                   {showLangMenu && (
                     <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute top-12 sm:top-14 right-12 sm:right-20 bg-white rounded-2xl shadow-2xl border border-emerald-50 p-2 min-w-[110px] z-[70]"
                     >
                       <LangBtn active={language === 'en'} onClick={() => { setLanguage('en'); setShowLangMenu(false); }} label="English" />
                       <LangBtn active={language === 'hi'} onClick={() => { setLanguage('hi'); setShowLangMenu(false); }} label="हिन्दी" />
                       <LangBtn active={language === 'kn'} onClick={() => { setLanguage('kn'); setShowLangMenu(false); }} label="ಕನ್ನಡ" />
                     </motion.div>
                   )}
                 </AnimatePresence>

                 {/* Menu */}
                 <motion.div className="relative">
                   <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                   >
                     <MoreVertical size={18} />
                   </button>

                   <AnimatePresence>
                     {showMenu && (
                       <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute top-10 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 p-1 w-48 z-[70]"
                       >
                         <MenuBtn icon={<Download size={16} />} label={t.downloadChat} onClick={downloadChat} />
                         <MenuBtn icon={<RotateCcw size={16} />} label={t.resetChat} onClick={clearChat} className="text-red-600" />
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </motion.div>
              </div>
           </div>
        </div>

        {/* Chat Canvas */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:py-8 scroll-smooth pb-32 w-full">
           <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
              <AnimatePresence>
              {messages.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex gap-2 sm:gap-4 group ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  onMouseEnter={() => m.sender !== 'ai' || favorites.includes(m.id)}
                >
                  <div className={`shrink-0 h-8 sm:h-10 w-8 sm:w-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm text-xs sm:text-base ${m.sender === 'user' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-emerald-600 border-2 border-emerald-100'}`}>
                    {m.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  
                  <div className={`flex flex-col max-w-full sm:max-w-2xl ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <motion.div 
                      className={`relative p-3 sm:p-5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-medium leading-relaxed shadow-lg transition-all ${m.sender === 'user' 
                        ? 'bg-emerald-700 text-white rounded-tr-none shadow-emerald-700/20' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-black/5'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <FormattedMessage text={m.text} isUser={m.sender === 'user'} />
                    </motion.div>
                    
                    <div className="flex items-center gap-1 sm:gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">{m.time}</span>
                      
                      {m.sender === 'ai' && (
                        <div className="flex gap-0.5 sm:gap-1">
                          <button 
                            onClick={() => copyToClipboard(m.text, m.id)}
                            className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-xs sm:text-sm"
                            title={t.copy}
                          >
                            {copiedId === m.id ? '✓' : <Copy size={14} />}
                          </button>
                          <button 
                            onClick={() => toggleFavorite(m.id)}
                            className={`p-1 sm:p-1.5 rounded-lg transition-all text-xs sm:text-sm ${favorites.includes(m.id) ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                            title={t.favorite}
                          >
                            {favorites.includes(m.id) ? <Heart size={14} fill="currentColor" /> : <Heart size={14} />}
                          </button>
                          <button 
                            onClick={() => deleteMessage(m.id)}
                            className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all text-xs sm:text-sm"
                            title={t.delete}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                   <div className="shrink-0 h-10 w-10 rounded-2xl bg-white border-2 border-emerald-100 text-emerald-600 flex items-center justify-center">
                     <Bot size={18} />
                   </div>
                   <div className="bg-white border-2 border-slate-200 px-4 sm:px-6 py-3 sm:py-4 rounded-3xl rounded-tl-none flex gap-2 shadow-lg">
                      <motion.div className="h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-400 rounded-full" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
                      <motion.div className="h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-400 rounded-full" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }} />
                      <motion.div className="h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-400 rounded-full" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, delay: 0.4, repeat: Infinity }} />
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
              <div ref={messagesEndRef} />
           </div>
        </div>



        {/* Intelligent Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-4 pb-4 sm:pb-6 px-4">
           <form 
            className="mx-auto max-w-3xl bg-white/95 backdrop-blur-xl rounded-3xl border border-emerald-100 p-2 sm:p-3 pl-4 sm:pl-6 shadow-2xl flex items-center gap-2 pr-2"
            onSubmit={(e) => { e.preventDefault(); sendMessage(draft); }}
           >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t.placeholder}
                maxLength={500}
                className="flex-1 bg-transparent py-3 sm:py-4 text-xs sm:text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
              />

              <div className="flex items-center gap-1">
                 <motion.button 
                  type="button" 
                  onClick={toggleVoiceInput}
                  disabled={isTyping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`h-10 sm:h-12 w-10 sm:w-12 flex items-center justify-center rounded-full transition-all text-sm sm:text-lg shrink-0 ${
                    isListening 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-300 animate-pulse' 
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                 >
                    <Mic size={20} />
                 </motion.button>
                 <motion.button 
                  type="submit"
                  disabled={!draft.trim() || isTyping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-12 sm:h-14 w-12 sm:w-14 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all active:scale-95 disabled:grayscale disabled:opacity-50 shrink-0"
                 >
                    <SendHorizontal size={22} />
                 </motion.button>
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

function MenuBtn({ icon, label, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}