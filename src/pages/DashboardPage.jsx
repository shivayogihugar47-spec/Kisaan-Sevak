import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MapPin,
  Droplets,
  CloudRain,
  Sun,
  ArrowRight,
  Store,
  FileText,
  Users,
  Recycle,
  Stethoscope,
  TrendingUp,
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
      const articles = await getAgricultureNews("agriculture India", 1);
      if (articles && articles.length > 0) {
        setNews(articles[0]);
      }
      setLoading(false);
    };
    fetchNews();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-6 md:px-8">
      {/* --- GREETING SECTION --- */}
      <div className="section-fade mb-6">
        <h2 className="text-2xl font-black text-[#064E3B] leading-tight">
          Namaste, Ramesh Ji!
        </h2>
        <p className="text-[13px] font-medium text-slate-500 mt-1">
          {new Date().toLocaleDateString(content.locale, { 
            weekday: 'long', 
            day: 'numeric',
            month: 'short'
          })} • {new Date().toLocaleTimeString(content.locale, {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        
        {/* --- WEATHER HERO CARD --- */}
        <div className="bg-[#14532D] rounded-[24px] p-6 text-white shadow-lg section-fade-delay relative overflow-hidden">
          {/* Subtle Sun Icon in Background */}
          <Sun size={120} className="absolute -right-6 -top-6 text-white/10" strokeWidth={1} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100/80 mb-6">
              <MapPin size={14} className="text-emerald-400" />
              Ludhiana, Punjab
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-[64px] font-bold leading-none tracking-tighter">
                  28°C
                </h3>
                <p className="text-sm font-medium text-emerald-100/90 mt-2">
                  Clear Skies • High of 32°C
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center min-w-[70px]">
                  <Droplets size={18} className="mx-auto mb-1 text-emerald-300" />
                  <p className="text-[11px] font-bold">65%</p>
                  <p className="text-[9px] text-emerald-100/60 uppercase font-black">Hum.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center min-w-[70px]">
                  <CloudRain size={18} className="mx-auto mb-1 text-emerald-300" />
                  <p className="text-[11px] font-bold">10%</p>
                  <p className="text-[9px] text-emerald-100/60 uppercase font-black">Rain</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- TOP MANDI PRICE HIGHLIGHT --- */}
        <Link 
          to="/mandi"
          className="flex items-center justify-between bg-[#FFEDD5] rounded-2xl p-4 shadow-sm border border-orange-100 no-underline group hover:shadow-md transition-all section-fade-delay"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-200/50 rounded-xl flex items-center justify-center text-orange-700">
               <TrendingUp size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-orange-800/60 leading-none mb-1">Top Mandi Price</p>
              <h4 className="text-base font-bold text-slate-900 font-display">
                Wheat ₹2,450/qtl <span className="text-green-600 font-bold ml-1">(↑ ₹50)</span>
              </h4>
            </div>
          </div>
          <ArrowRight size={18} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* --- MODULES LIST --- */}
        <div className="space-y-3 section-fade-late pt-2">
          {[
            {
              title: "Daily Farm Brief",
              subtitle: "Your farm's daily summary and task list.",
              icon: Sun,
              color: "bg-[#14532D] text-white",
              route: "/brief",
            },
            {
              title: "Mandi Mitra",
              subtitle: "Live prices from 5 nearest mandis.",
              icon: Store,
              color: "bg-orange-500 text-white",
              route: "/mandi",
            },
            {
              title: "Crop Doctor",
              subtitle: "Check your plants for diseases instantly.",
              icon: Stethoscope,
              color: "bg-red-500 text-white",
              route: "/crop-doctor",
            },
            {
              title: "Sarkar Saathi",
              subtitle: "Government schemes curated for you.",
              icon: FileText,
              color: "bg-[#7C2D12] text-white",
              route: "/schemes",
            },
            {
              title: "Waste to Wealth",
              subtitle: "Sell your crop residue at best prices.",
              icon: Recycle,
              color: "bg-emerald-900 text-white",
              route: "/waste-to-wealth",
            },
            {
              title: "Kisaan Network",
              subtitle: "Connect with nearby farmers and experts.",
              icon: Users,
              color: "bg-slate-500 text-white",
              route: "/network",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                to={item.route}
                className="flex items-center gap-4 bg-white p-4 rounded-[22px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] no-underline group active:scale-[0.98] transition-all"
              >
                <div className={`h-12 w-12 rounded-2xl ${item.color} flex-shrink-0 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[17px] font-bold text-slate-900 leading-tight">{item.title}</h4>
                  <p className="text-[13px] text-slate-500 mt-1 line-clamp-1">{item.subtitle}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* --- FEATURE BANNER --- */}
        <div className="relative rounded-[24px] overflow-hidden group h-48 section-fade-late shadow-xl shadow-slate-200/50 mt-8 mb-4 cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1589923188900-85dae523342b"
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt="New Feature"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent p-6 flex flex-col justify-end">
            <span className="bg-[#FBBF24] text-[#064E3B] text-[10px] px-2.5 py-1 rounded-md font-black tracking-widest uppercase mb-3 w-fit">
              NEW UPDATE
            </span>
            <h3 className="text-white font-bold text-xl leading-tight">
              Smart Irrigation for Wheat Crops
            </h3>
            <p className="text-white/70 text-sm mt-1">
              Expert guide to save water and increase yield.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
