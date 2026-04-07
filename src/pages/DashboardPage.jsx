import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MapPin,
  Droplets,
  CloudRain,
  Sun,
  Store,
  FileText,
  Users,
  Recycle,
  Stethoscope,
  Volume2,
  ChevronRight,
  Zap,
} from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";
import { getAgricultureNews } from "../services/newsService";

export default function Dashboard() {
  const { content } = useLanguage();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const articles = await getAgricultureNews("agriculture India", 1);
        if (articles && articles.length > 0) {
          setNews(articles[0]);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchNews();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF7F2] font-sans text-[#032115]">
      {/* --- TOP NAV --- */}
      <nav className="px-6 py-5 flex items-center justify-between section-fade">
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <Zap size={18} fill="currentColor" />
           </div>
           <span className="text-xl font-black tracking-tight">Kisaan Sevak</span>
        </div>
        <LanguageSwitcher />
      </nav>

      <div className="px-6 max-w-2xl mx-auto space-y-8">
        
        {/* --- GREETING --- */}
        <header className="section-fade-delay">
          <h1 className="text-3xl font-black leading-tight text-slate-900">
            {content.dashboard.greeting}
          </h1>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mt-1 uppercase tracking-wider">
             <MapPin size={14} /> Belgaum • {new Date().toLocaleDateString(content.locale, { weekday: 'long' })}
          </div>
        </header>

        {/* --- AIRY PREMIUM WEATHER HERO --- */}
        <div className="relative group overflow-hidden h-[300px] md:h-[260px] rounded-[40px] shadow-2xl section-fade-delay border border-white">
           {/* Dynamic Background Image */}
           <img 
             src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2064&auto=format&fit=crop" 
             className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
             alt="Field"
           />
           {/* Elegant Overlay */}
           <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 via-emerald-900/40 to-transparent p-8 md:p-10 flex flex-col justify-between">
              
              <div className="flex justify-between items-start">
                 <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-sm">
                    <div className="flex items-center gap-2">
                       <MapPin size={14} className="text-emerald-300" />
                       <span className="text-xs font-black uppercase tracking-widest text-white">{content.locationLabel}</span>
                    </div>
                 </div>
                 <button className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-emerald-500 transition-colors">
                    <Volume2 size={22} />
                 </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div>
                    <h2 className="text-7xl font-black text-white leading-none tracking-tighter">28°</h2>
                    <p className="text-emerald-100 font-bold text-lg mt-2 flex items-center gap-2">
                       <Sun size={20} className="text-yellow-400" /> {content.weather.codes.clear} • 32° High
                    </p>
                 </div>
                 
                 <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[28px] px-6 py-4 flex items-center gap-3">
                       <Droplets size={20} className="text-emerald-300" />
                       <div>
                          <p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest leading-none mb-1">{content.brief.humidity}</p>
                          <p className="text-xl font-black text-white">65%</p>
                       </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[28px] px-6 py-4 flex items-center gap-3">
                       <CloudRain size={20} className="text-emerald-300" />
                       <div>
                          <p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest leading-none mb-1">{content.weather.codes.rain}</p>
                          <p className="text-xl font-black text-white">10%</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- VIBRANT BENTO GRID (Solid Soft Colors) --- */}
        <div className="grid grid-cols-2 gap-4 section-fade-late">
          {[
            {
              title: content.dashboard.modules[0].title,
              subtitle: content.dashboard.modules[0].subtitle,
              icon: Sun,
              bg: "bg-[#E2F2E9]",
              text: "text-[#065F46]",
              iconBg: "bg-white",
              route: "/brief",
            },
            {
              title: content.dashboard.modules[1].title,
              subtitle: content.dashboard.modules[1].subtitle,
              icon: Store,
              bg: "bg-[#FFF4E6]",
              text: "text-[#92400E]",
              iconBg: "bg-white",
              route: "/mandi",
            },
            {
              title: content.dashboard.modules[2].title,
              subtitle: content.dashboard.modules[2].subtitle,
              icon: Stethoscope,
              bg: "bg-[#FEE2E2]",
              text: "text-[#991B1B]",
              iconBg: "bg-white",
              route: "/crop-doctor",
            },
            {
              title: content.dashboard.modules[3].title,
              subtitle: content.dashboard.modules[3].subtitle,
              icon: FileText,
              bg: "bg-[#DBEAFE]",
              text: "text-[#1E40AF]",
              iconBg: "bg-white",
              route: "/schemes",
            },
            {
              title: content.dashboard.modules[4].title,
              subtitle: content.dashboard.modules[4].subtitle,
              icon: Recycle,
              bg: "bg-[#F0FDF4]",
              text: "text-[#166534]",
              iconBg: "bg-white",
              route: "/waste-to-wealth",
            },
            {
              title: content.dashboard.modules[5].title,
              subtitle: content.dashboard.modules[5].subtitle,
              icon: Users,
              bg: "bg-[#F1F5F9]",
              text: "text-[#334155]",
              iconBg: "bg-white",
              route: "/network",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                to={item.route}
                className={`relative ${item.bg} p-6 rounded-[32px] no-underline transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-[170px] border border-transparent hover:border-white shadow-sm`}
              >
                <div className={`${item.iconBg} h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm`}>
                  <Icon size={24} className={item.text} strokeWidth={2.5} />
                </div>
                
                <div>
                   <h4 className={`text-[17px] font-black leading-tight ${item.text}`}>
                     {item.title}
                   </h4>
                   <div className="flex items-center justify-between mt-1">
                      <p className={`text-[10px] font-bold opacity-60 uppercase tracking-widest`}>
                        {item.subtitle}
                      </p>
                      <ChevronRight size={14} className="opacity-40" />
                   </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* --- LATEST UPDATES --- */}
        <div className="section-fade-late pt-4 pb-12">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">Latest for Farm</h3>
              <button className="text-[11px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">Explore all</button>
           </div>

           <a
             href={news?.url || "#"}
             target="_blank"
             rel="noopener noreferrer"
             className="flex gap-4 items-center bg-white p-4 rounded-[24px] border border-slate-200/60 shadow-sm group no-underline"
           >
              <div className="h-20 w-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                 <img src={news?.urlToImage || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2045&auto=format&fit=crop"} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt="news" />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{content.dashboard.newsLabel}</p>
                 <h4 className="text-sm font-black leading-snug line-clamp-2 text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {loading ? content.common.loading : news?.title || "Agriculture Update"}
                 </h4>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-600" />
           </a>
        </div>
      </div>
    </main>
  );
}
