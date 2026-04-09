import { AnimatePresence, motion } from 'framer-motion';
import { 
  Building2, CheckCircle2, CloudRain, FileText, Loader2, ShieldCheck, 
  HelpCircle, PhoneIncoming, ExternalLink, Info, BadgeCheck, FileWarning, 
  Globe, Landmark, HeartHandshake, PackageOpen, ChevronRight,
  TrendingUp, Award, UserCheck, Activity, Search, ArrowUpRight
} from 'lucide-react';
import React, { useState } from 'react';
import Card from "../components/Card";
import Header from "../components/Header";
import PageWrapper from "../components/PageWrapper";
import { useLanguage } from "../context/LanguageContext";

const T = {
    en: {
        title: "Agri-Insurance", subtitle: "Official government portals & support",
        heroTitle: "Pradhan Mantri Fasal Bima Yojana",
        heroDesc: "The flagship government crop insurance scheme. Verify your state's notification status and enroll through the official PMFBY portal.",
        heroBtn: "Open PMFBY Portal",
        officialTitle: "Government Authorized Channels", officialSubtitle: "Verified portals for enrollment and claims",
        genuine: "Genuine", govtPortal: "Govt Portal", publicInsurer: "Public Sector",
        pmfbyTitle: "PMFBY Portal", pmfbyDesc: "Primary portal for enrollment and application status.",
        aicTitle: "AIC of India", aicDesc: "Specialist insurer for national crop schemes.",
        upisTitle: "Unified Scheme", upisDesc: "Package cover for crops and farm assets.",
        rwbcisTitle: "RWBCIS Phase II", rwbcisDesc: "Weather-based insurance for horticulture.",
        visitBtn: "Visit",
        beforeTitle: "Safety Checklist", supportTitle: "Quick Support",
        check1: "Verify the insurer name, scheme, and village notification.",
        check2: "Save payment proof and policy receipts immediately.",
        check3: "If someone cannot show an official website, do not pay.",
        path1: "Open PMFBY portal first", path2: "Crop-insurance support", path3: "AIC insurer site"
    },
    hi: {
        title: "कृषि बीमा", subtitle: "आधिकारिक सरकारी पोर्टल और सहायता",
        heroTitle: "प्रधानमंत्री फसल बीमा योजना",
        heroDesc: "सरकार की प्रमुख फसल बीमा योजना। अपने राज्य की स्थिति सत्यापित करें और आधिकारिक PMFBY पोर्टल के माध्यम से नामांकन करें।",
        heroBtn: "PMFBY पोर्टल खोलें",
        officialTitle: "सरकारी अधिकृत चैनल", officialSubtitle: "नामांकन और दावों के लिए सत्यापित पोर्टल",
        genuine: "प्रामाणिक", govtPortal: "सरकारी पोर्टल", publicInsurer: "सार्वजनिक क्षेत्र",
        pmfbyTitle: "PMFBY पोर्टल", pmfbyDesc: "नामांकन और आवेदन स्थिति के लिए प्राथमिक पोर्टल।",
        aicTitle: "भारतीय कृषि बीमा", aicDesc: "राष्ट्रीय फसल योजनाओं के लिए विशेषज्ञ बीमाकर्ता।",
        upisTitle: "एकीकृत योजना", upisDesc: "फसल और कृषि संपत्ति के लिए पैकेज कवर।",
        rwbcisTitle: "RWBCIS चरण II", rwbcisDesc: "बागवानी के लिए मौसम आधारित बीमा।",
        visitBtn: "जाएं",
        beforeTitle: "सुरक्षा चेकलिस्ट", supportTitle: "त्वरित सहायता",
        check1: "बीमाकर्ता का नाम, योजना और गांव की अधिसूचना सत्यापित करें।",
        check2: "भुगतान प्रमाण और पॉलिसी रसीद तुरंत सुरक्षित करें।",
        check3: "यदि कोई आधिकारिक वेबसाइट नहीं दिखा सकता, तो भुगतान न करें।",
        path1: "पहले PMFBY पोर्टल खोलें", path2: "फसल-बीमा सहायता", path3: "AIC बीमाकर्ता साइट"
    },
    kn: {
        title: "ಕೃಷಿ ವಿಮೆ", subtitle: "ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳು ಮತ್ತು ಬೆಂಬಲ",
        heroTitle: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ",
        heroDesc: "ಸರ್ಕಾರದ ಪ್ರಮುಖ ಬೆಳೆ ವಿಮೆ ಯೋಜನೆ. ನಿಮ್ಮ ರಾಜ್ಯದ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಅಧಿಕೃತ PMFBY ಪೋರ್ಟಲ್ ಮೂಲಕ ನೋಂದಾಯಿಸಿ.",
        heroBtn: "PMFBY ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ",
        officialTitle: "ಸರ್ಕಾರಿ ಅಧಿಕೃತ ಚಾನೆಲ್‌ಗಳು", officialSubtitle: "ನೋಂದಣಿ ಮತ್ತು ಕ್ಲೈಮ್‌ಗಳಿಗಾಗಿ ಪರಿಶೀಲಿಸಿದ ಪೋರ್ಟಲ್‌ಗಳು",
        genuine: "ಅಧಿಕೃತ", govtPortal: "ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್", publicInsurer: "ಸಾರ್ವಜನಿಕ ವಲಯ",
        pmfbyTitle: "PMFBY ಪೋರ್ಟಲ್", pmfbyDesc: "ನೋಂದಣಿ ಮತ್ತು ಅರ್ಜಿ ಸ್ಥಿತಿಗಾಗಿ ಪ್ರಾಥಮಿಕ ಪೋರ್ಟಲ್.",
        aicTitle: "ಭಾರತೀಯ ಕೃಷಿ ವಿಮೆ", aicDesc: "ರಾಷ್ಟ್ರೀಯ ಬೆಳೆ ಯೋಜನೆಗಳಿಗಾಗಿ ತಜ್ಞ ವಿಮೆದಾರ.",
        upisTitle: "ಏಕೀಕೃತ ಯೋಜನೆ", upisDesc: "ಬೆಳೆಗಳು ಮತ್ತು ಕೃಷಿ ಆಸ್ತಿಗಳಿಗೆ ಪ್ಯಾಕೇಜ್ ಕವರ್.",
        rwbcisTitle: "RWBCIS ಹಂತ II", rwbcisDesc: "ತೋಟಗಾರಿಕೆಗಾಗಿ ಹವಾಮಾನ ಆಧಾರಿತ ವಿಮೆ.",
        visitBtn: "ಭೇಟಿ ನೀಡಿ",
        beforeTitle: "ಸುರಕ್ಷತಾ ಕ್ರಮಗಳು", supportTitle: "ತ್ವರಿತ ಸಹಾಯ",
        check1: "ವಿಮೆದಾರರ ಹೆಸರು, ಯೋಜನೆ ಮತ್ತು ಗ್ರಾಮದ ಅಧಿಸೂಚನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
        check2: "ಪಾವತಿ ಪುರಾವೆ ಮತ್ತು ರಸೀದಿಯನ್ನು ತಕ್ಷಣವೇ ಉಳಿಸಿ.",
        check3: "ಯಾರಾದರೂ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ತೋರಿಸಲು ಸಾಧ್ಯವಾಗದಿದ್ದರೆ ಹಣ ನೀಡಬೇಡಿ.",
        path1: "ಮೊದಲು PMFBY ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ", path2: "ಬೆಳೆ-ವಿಮೆ ಸಹಾಯ", path3: "AIC ವಿಮಾದಾರ ಸೈಟ್"
    }
};

export default function AgriInsure() {
    const { language, content } = useLanguage();
    const t = T[language] || T.en;

    const InsuranceCard = ({ type, title, desc, link, label, icon: Icon }) => (
        <Card className="flex flex-col bg-white border border-slate-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/5 group p-5">
            <div className="flex justify-between items-start mb-3">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{type}</span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-700">
                    <CheckCircle2 size={10} /> {t.genuine}
                </span>
            </div>
            <h4 className="mb-1 text-base font-black text-slate-900 leading-tight uppercase group-hover:text-emerald-700 transition-colors">{title}</h4>
            <p className="mb-4 text-[10px] font-bold text-slate-400 leading-normal">{desc}</p>
            
            <div className="mt-auto">
                <a 
                    href={link} target="_blank" rel="noopener noreferrer" 
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-emerald-800 px-4 py-3 text-[10px] font-black text-white transition-all active:scale-95 uppercase tracking-widest"
                >
                    {label} <ArrowUpRight size={14} />
                </a>
            </div>
        </Card>
    );

    const SupportAction = ({ label, link }) => (
        <a 
          href={link} target="_blank" rel="noopener noreferrer" 
          className="flex items-center justify-between group rounded-xl bg-slate-50 border border-slate-100 px-5 py-3 text-[11px] font-black text-slate-700 transition-all hover:bg-white hover:border-emerald-200"
        >
            <span className="group-hover:text-emerald-800 transition-colors uppercase tracking-tight">{label}</span>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-all" />
        </a>
    );

    return (
        <PageWrapper className="bg-white">
            <Header title={t.title} subtitle={t.subtitle} location={content.locationLabel} showBack maxWidth="max-w-6xl" />
            <main className="mx-auto mt-2 max-w-6xl px-4 pb-12">
                
                {/* COMPACT PMFBY HERO */}
                <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Landmark size={200} />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                           <Activity size={10} /> Verified Enrollment Open
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter uppercase leading-none">{t.heroTitle}</h2>
                        <p className="text-sm md:text-lg font-bold text-slate-400 mb-8 leading-relaxed italic">{t.heroDesc}</p>
                        <a href="https://pmfby.gov.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-all">
                            {t.heroBtn} <ExternalLink size={16} />
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                    {/* LEFT: Genuine Portals Grid */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{t.officialTitle}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.officialSubtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InsuranceCard type={t.govtPortal} title={t.pmfbyTitle} desc={t.pmfbyDesc} link="https://pmfby.gov.in/" label={t.visitBtn} />
                            <InsuranceCard type={t.publicInsurer} title={t.aicTitle} desc={t.aicDesc} link="https://www.aicofindia.com/" label={t.visitBtn} />
                            <InsuranceCard type={t.govtPortal} title={t.upisTitle} desc={t.upisDesc} link="https://pmfby.gov.in/" label={t.visitBtn} />
                            <InsuranceCard type={t.govtPortal} title={t.rwbcisTitle} desc={t.rwbcisDesc} link="https://www.aicofindia.com/" label={t.visitBtn} />
                        </div>
                    </div>

                    {/* RIGHT: Quick Support & Checklist */}
                    <div className="space-y-6">
                        <Card className="rounded-[1.5rem] bg-emerald-50/30 border border-emerald-100 p-6">
                           <h3 className="flex items-center gap-2 text-xs font-black text-emerald-950 uppercase tracking-widest mb-4">
                               <PhoneIncoming size={16} /> {t.supportTitle}
                           </h3>
                           <div className="space-y-2">
                               <SupportAction label={t.path1} link="https://pmfby.gov.in/" />
                               <SupportAction label={t.path2} link="https://pmfby.gov.in/tollFree" />
                               <SupportAction label={t.path3} link="https://www.aicofindia.com/" />
                           </div>
                        </Card>

                        <Card className="rounded-[1.5rem] bg-white border border-slate-100 p-6 relative overflow-hidden">
                           <div className="absolute -top-2 -right-2 p-4 text-slate-50 opacity-10"><FileWarning size={100} /></div>
                           <h3 className="flex items-center gap-2 text-xs font-black text-slate-950 uppercase tracking-widest mb-4">
                               <ShieldCheck size={16} className="text-emerald-600" /> {t.beforeTitle}
                           </h3>
                           <div className="space-y-3 relative z-10">
                               {[t.check1, t.check2, t.check3].map((item, idx) => (
                                   <div key={idx} className="flex gap-3">
                                       <div className="h-4 w-4 shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-[8px] font-black text-white">{idx+1}</div>
                                       <p className="text-[10px] font-bold text-slate-500 leading-tight">{item}</p>
                                   </div>
                               ))}
                           </div>
                        </Card>
                    </div>
                </div>

                {/* Claim History - Compact */}
                <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><FileText size={20} /></div>
                      <div>
                         <h4 className="text-xs font-black text-slate-900 uppercase">{t.history}</h4>
                         <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">{t.noClaims}</p>
                      </div>
                   </div>
                   <button className="px-6 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 shadow-sm">Query Service Bureau</button>
                </div>

            </main>
        </PageWrapper>
    );
}