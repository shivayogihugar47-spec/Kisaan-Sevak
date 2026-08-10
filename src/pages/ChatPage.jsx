import { Mic, SendHorizontal, Sparkles, User, Bot, ChevronDown, MoreVertical, Globe, Copy, Trash2, Heart, Download, RotateCcw, Settings, MessageCircle, TrendingUp, Zap } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
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
    subtitle: "Smart Agriculture Advisor for prices, crops, soil, and market insights",
    initialMessage: "Namaste! 🌾 I am your Kisaan AI agriculture advisor. Ask me about market prices, crop planning, soil health, pest control, or farm economics. I will answer in a structured and practical way using the latest available knowledge.",
    placeholder: "Ask about crop prices, soil advice, market trends or any farming question...", 
    voiceInput: "Voice Input",
    suggested: "ASK FOR AGRICULTURE INSIGHT",
    suggestions: [
      { id: 'market', label: "What are current wheat mandi prices?", icon: '📈' },
      { id: 'crop', label: "Which crop is best for the next rain season?", icon: '🌾' },
      { id: 'soil', label: "How to improve soil nitrogen in paddy fields?", icon: '🧪' }
    ],
    clearChat: "Clear Chat",
    copy: "Copy",
    delete: "Delete",
    favorite: "Favorite",
    downloadChat: "Download",
    resetChat: "Reset Conversation",
    messageCount: "Messages",
    copied: "Copied!",
    suggestedLabel: "Try questions like",
    tip: "Share your crop, region and season for the best answer.",
    responses: {
      fallback: "I am processing your agriculture query. Please provide any local context like crop, region, or season to improve the recommendation."
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

    const [messages, setMessages] = useState([
    {
      id: `INIT-${language}`,
      sender: "ai",
      text: t.initialMessage,
      time: getCurrentTimeLabel(content?.locale || 'en-IN')
    }
  ]);
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
  }, [language]);

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
         en: "You are an expert agriculture advisor. Answer all questions about farming, market prices, crop choice, soil health, pest control, weather, and agro-economics. Use the latest available knowledge and assume you can research the internet for current information. Provide answers in a structured way with clear headings, short paragraphs, and bullet lists when appropriate. Include sections such as 'Key insights', 'Recommendations', and 'Next steps'. Keep the tone practical and focused on action.",
         hi: "आप एक विशेषज्ञ कृषि सलाहकार हैं। खेती, बाजार की कीमतें, फसल चयन, मिट्टी की सेहत, कीट नियंत्रण, मौसम और कृषि अर्थव्यवस्था के बारे में सभी प्रश्नों का उत्तर दें। नवीनतम जानकारी का उपयोग करें और मान लें कि आप इंटरनेट पर वर्तमान जानकारी खोज सकते हैं। स्पष्ट शीर्षक, छोटे पैराग्राफ और आवश्यक होने पर बुलेट सूची के साथ संरचित उत्तर दें। 'मुख्य जानकारी', 'सिफारिशें', और 'अगले कदम' जैसे अनुभाग शामिल करें। स्वर व्यावहारिक और कार्रवाई-उन्मुख रखें।",
         kn: "ನೀವು ಒಂದು ಪರಿಣಿತ ಕೃಷಿ ಸಲಹೆಗಾರರಾಗಿರುತ್ತೀರಿ. ಕೃಷಿ, ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು, ಬೆಳೆ ಆಯ್ಕೆ, ಮಣ್ಣು ಆರೋಗ್ಯ, ಕೀಟ ನಿಯಂತ್ರಣ, ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಆರ್ಥಿಕಶಾಸ್ತ್ರದ ಕುರಿತು ಎಲ್ಲಾ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ ನೀಡಿ. ಇತ್ತೀಚಿನ ಲಭ್ಯವಿರುವ ಜ್ಞಾನವನ್ನು ಬಳಸಿ ಮತ್ತು ನೀವು ಇಂಟರ್ನೆಟ್‌ನಲ್ಲಿ ಪ್ರಸ್ತುತ ಮಾಹಿತಿಯನ್ನು ಹುಡುಕಬಹುದು ಎಂದು ಪರಿಗಣಿಸಿ. ಸ್ಪಷ್ಟ ಶೀರ್ಷಿಕೆಗಳು, ಚಿಕ್ಕ ಪ್ರಬಂಧಗಳು ಮತ್ತು ಅಗತ್ಯವಾದಾಗ ಗುಂಡಿತ ಪ್ರಶ್ನೆಗಳೊಂದಿಗೆ ರಚನೆಗೊಳಿಸಿದ ಉತ್ತರಗಳನ್ನು ಒದಗಿಸಿ. 'ಪ್ರಮುಖ ಅಂಶಗಳು', 'ಶಿಫಾರಸುಗಳು', ಮತ್ತು 'ಮುಂದಿನ ಹೆಜ್ಜೆಗಳು' ಎಂಬ ವಿಭಾಗಗಳನ್ನು ಒಳಗೊಂಡಿರಲಿ. ಶೈಲಿ ಪ್ರಾಯೋಗಿಕ ಮತ್ತು ಕ್ರಿಯಾತ್ಮಕವಾಗಿರಲಿ."
      }[language] || "You are an expert agriculture advisor. Answer all farming questions with structured, actionable guidance, using current knowledge and internet-style research. Include headings, bullets, and specific recommendations.";

      const apiMessages = [
        { role: 'system', content: systemPrompts[language] },
        ...history,
        { role: 'user', content: cleanText }
      ];

      if (!history.length && !cleanText.toLowerCase().includes('price') && !cleanText.toLowerCase().includes('weather')) {
        // encourage broad agricultural answers for first requests
        apiMessages.unshift({
          role: 'system',
          content: 'Use internet-style research to answer with structured agriculture insights whenever possible, including price signals, market context, and practical farm actions.'
        });
      }

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
    <PageWrapper className="bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 min-h-screen">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl">
          <div className="rounded-[32px] border border-slate-200 bg-white/95 shadow-2xl shadow-slate-200/80 overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Kisaan AI</p>
                <h1 className="mt-2 text-3xl font-black text-slate-900">Agriculture Chat Assistant</h1>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Globe size={16} />
                  <span className="uppercase">{language}</span>
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                  >
                    <MoreVertical size={18} />
                  </button>
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 top-12 z-50 w-48 rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl"
                      >
                        <MenuBtn icon={<Download size={16} />} label={t.downloadChat} onClick={downloadChat} />
                        <MenuBtn icon={<RotateCcw size={16} />} label={t.resetChat} onClick={clearChat} className="text-red-600" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-8 sm:px-8 sm:py-10">
              <div className="mx-auto max-w-6xl">
                <div className="rounded-[32px] bg-white px-6 py-6 shadow-sm border border-slate-200 min-h-[70vh]">
                  <div className="space-y-6">
                    <AnimatePresence>
                      {messages.map((m, idx) => (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 18, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`rounded-[28px] border px-6 py-5 text-sm leading-7 shadow-sm max-w-[95%] ${m.sender === 'user' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-900 border-slate-200'}`}>
                            <FormattedMessage text={m.text} isUser={m.sender === 'user'} />
                            <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{m.time}</div>
                          </div>
                        </motion.div>
                      ))}

                      {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
                            <Bot size={18} />
                          </div>
                          <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-bounce" />
                            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-bounce delay-150" />
                            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-bounce delay-300" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="mt-6 rounded-[34px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <form 
                    className="flex flex-col gap-3 md:flex-row md:items-center"
                    onSubmit={(e) => { e.preventDefault(); sendMessage(draft); }}
                  >
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={t.placeholder}
                      maxLength={500}
                      className="flex-1 rounded-3xl border border-slate-200 bg-slate-100 px-5 py-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    />

                    <div className="flex items-center gap-3 md:ml-4">
                      <button 
                        type="button" 
                        onClick={toggleVoiceInput}
                        disabled={isTyping}
                        className={`flex h-12 w-12 items-center justify-center rounded-3xl transition ${
                          isListening 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-300 animate-pulse' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title={t.voiceInput}
                      >
                        <Mic size={20} />
                      </button>
                      <button 
                        type="submit"
                        disabled={!draft.trim() || isTyping}
                        className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-xl transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <SendHorizontal size={22} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
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
