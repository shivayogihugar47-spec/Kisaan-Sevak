import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart4, Building2, ChevronRight, CreditCard, Download, FileText,
  Handshake, LogOut, MapPin, PackageOpen, Search, ShieldCheck,
  TrendingUp, Truck, User, Users, ArrowUpRight, Zap, Filter, 
  Settings, Bell, Layers, MoreVertical, CheckCircle2, AlertCircle, Clock, X,
  Activity, Globe, Calendar, MousePointer2
} from "lucide-react";
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import PageWrapper from "../components/PageWrapper";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { listAuctionsSource, placeBid } from "../lib/marketplace";
import { formatPrice } from "../utils/helpers";
import { listEnterpriseContracts } from "../services/enterpriseContractsService";

const T = {
  en: {
    badge: "Enterprise Hub Pro", title: "Procurement Portal", desc: "Institutional grade supply chain intelligence.",
    search: "Search lots...", totalProcured: "Procured", activeContracts: "Contracts",
    inTransit: "Logistics", budgetSpent: "Liquidity",
    tabs: { procure: "Sourcing", logistics: "Live Radar", contracts: "Vault", analytics: "Insights" },
    logout: "Exit",
  },
  kn: {
    badge: "ಎಂಟರ್‌ಪ್ರೈಸ್ ಹಬ್ ಪ್ರೊ", title: "ಸಂಗ್ರಹಣೆ", desc: "ಸಂಗ್ರಹಣೆ ಗುಪ್ತಚರ.",
    search: "ಹುಡುಕಿ...", totalProcured: "ಖರೀದಿ", activeContracts: "ಒಪ್ಪಂದ",
    inTransit: "ಲಾಜಿಸ್ಟಿಕ್ಸ್", budgetSpent: "ಲಿಕ್ವಿಡಿಟಿ",
    tabs: { procure: "ಸೋರ್ಸಿಂಗ್", logistics: "ಲೈವ್ ರಾಡಾರ್", contracts: "ವಾಲ್ಟ್", analytics: "ಒಳನೋಟಗಳು" },
    logout: "ಲಾಗ್ ಔಟ್",
  }
};

const CHART_DATA = [
  { day: 'Mon', price: 2100 }, { day: 'Tue', price: 2250 }, { day: 'Wed', price: 2200 },
  { day: 'Thu', price: 2400 }, { day: 'Fri', price: 2550 }, { day: 'Sat', price: 2500 }
];

export default function EnterpriseDashboardPage() {
  const { language } = useLanguage();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const t = T[language] || T.en;

  const [activeTab, setActiveTab] = useState('procure');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [query, setQuery] = useState("");
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");

  const enterpriseId = profile?.id || "";
  const myName = String(profile?.name || "").toLowerCase();
  const myPhone = String(profile?.phone || "");

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, cRes] = await Promise.all([
        listAuctionsSource(),
        enterpriseId ? listEnterpriseContracts({ enterpriseId }) : { data: [] }
      ]);
      setAuctions(aRes.data || []);
      setContracts(cRes.data || []);
    } catch (error) { console.error("Load failed", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [enterpriseId]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    if (signOut) await signOut();
    navigate("/");
  };

  const submitBid = async () => {
    if (!selectedAuction || !bidAmount) return;
    try {
      await placeBid({
        auctionId: selectedAuction.id,
        buyerPhone: profile?.phone || "",
        buyerName: profile?.name || "",
        buyerType: "enterprise",
        amountTotal: Number(bidAmount),
      });
      setSelectedAuction(null);
      setBidAmount("");
      loadData();
    } catch (e) { alert(e.message || "Failed"); }
  };

  const stats = useMemo(() => {
    const wonLots = auctions.filter(a => {
      if (a.status !== 'completed' || !a.acceptedBidId) return false;
      const winner = (a.bids || []).find(b => b.id === a.acceptedBidId);
      return (myPhone && String(winner?.buyer?.phone) === myPhone) || (myName && String(winner?.buyer?.name).toLowerCase() === myName);
    });
    const vTotal = wonLots.reduce((sum, a) => sum + Number(a.quantityTons || 0), 0);
    const sTotal = wonLots.reduce((sum, a) => {
      const winner = (a.bids || []).find(b => b.id === a.acceptedBidId);
      return sum + Number(winner?.amountTotal || 0);
    }, 0);
    const transitC = contracts.filter(c => ['in_transit', 'shipping'].includes(String(c.status).toLowerCase()));

    return {
      procured: `${Math.round(vTotal)} Tons`,
      active: contracts.length.toString(),
      transit: transitC.length.toString(),
      spent: formatPrice(sTotal, "en-IN"),
      transitItems: transitC.slice(0, 3)
    };
  }, [auctions, contracts, myName, myPhone]);

  const filteredAuctions = useMemo(() => {
    const q = query.toLowerCase().trim();
    return auctions.filter(a => !q || a.residueType?.toLowerCase().includes(q) || a.seller?.name?.toLowerCase().includes(q));
  }, [auctions, query]);

  return (
    <PageWrapper className="bg-[#F9FBFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:pb-32">
        
        {/* ENHANCED STRATEGIC HEADER */}
        <header className="flex flex-col gap-6 mb-10">
          <div className="flex items-center justify-between">
             <div className="space-y-1">
                <div className="inline-flex items-center gap-2 bg-emerald-700 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">
                   <Activity size={10} className="animate-pulse" /> {t.badge}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-none pt-2">{t.title}</h1>
                <p className="text-slate-400 font-bold text-xs">Connected to Mandi Live-Feed • {auctions.length} Active Lots</p>
             </div>
             <div className="flex gap-3">
                <button className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm hover:text-emerald-600 transition-colors"><Bell size={20} /></button>
                <button onClick={handleLogout} className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-black text-xs flex items-center gap-2 hover:bg-slate-800 transition-all"><LogOut size={16} /> {t.logout}</button>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search} className="w-full h-14 bg-white border border-slate-100 rounded-2xl pl-12 pr-6 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500/30 shadow-sm transition-all" />
             </div>
             <div className="flex gap-2">
                <button className="flex-1 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-slate-600 shadow-sm px-4">
                   <Calendar size={18} /> SCHEDULE
                </button>
                <button className="h-14 w-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm"><Globe size={20} /></button>
             </div>
          </div>
        </header>

        {/* STRATEGIC KPI GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
           <KPICard title={t.totalProcured} value={stats.procured} trend="+2.4%" icon={PackageOpen} color="emerald" desc="Lifetime aggregate" />
           <KPICard title={t.activeContracts} value={stats.active} trend="Active" icon={Handshake} color="indigo" desc="Verified agreements" />
           <KPICard title={t.inTransit} value={`${stats.transit} Lots`} trend="Live" icon={Truck} color="sky" desc="Shipment tracking" />
           <KPICard title={t.budgetSpent} value={stats.spent} trend="Liquid" icon={TrendingUp} color="amber" desc="Escrow balance" />
        </div>

        {/* PREMIUM ANALYTICS TAB BAR */}
        <div className="sticky top-4 z-40 p-1.5 bg-white/90 backdrop-blur-2xl border border-white/20 rounded-[1.5rem] mb-10 shadow-2xl shadow-slate-200/50 flex gap-1 overflow-x-auto no-scrollbar">
           {Object.entries(t.tabs).map(([key, label]) => (
             <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 min-w-[100px] py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === key ? 'bg-slate-950 text-white shadow-xl shadow-slate-900/40' : 'text-slate-400 hover:text-slate-600'}`}>
               {label}
             </button>
           ))}
        </div>

        {/* FEATURE-RICH CONTENT AREA */}
        <AnimatePresence mode="wait">
           {activeTab === 'procure' && (
             <motion.div key="procure" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* MARKET INDEX VISUALIZATION */}
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                         <h3 className="text-xl font-black text-slate-950 tracking-tight">Market Price Index</h3>
                         <p className="text-xs font-bold text-slate-400">Weekly trend for aggregate agri-commodities</p>
                      </div>
                      <div className="flex gap-2">
                         <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100">STABLE</div>
                      </div>
                   </div>
                   <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={CHART_DATA}>
                            <defs>
                               <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                            <Area type="monotone" dataKey="price" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-black text-slate-950 tracking-tight">Active Sourcing Radar</h2>
                   <div className="flex gap-2">
                      <button className="h-10 px-4 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 flex items-center gap-2"><Filter size={14} /> FILTERS</button>
                      <button className="h-10 px-4 bg-emerald-700 text-white rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg shadow-emerald-200"><Zap size={14} /> QUICK BID</button>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                   {filteredAuctions.map(a => <AuctionCard key={a.id} auction={a} onBid={() => setSelectedAuction(a)} />)}
                   {filteredAuctions.length === 0 && <div className="py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-center text-slate-400 font-bold">No results match your procurement criteria.</div>}
                </div>
             </motion.div>
           )}

           {activeTab === 'logistics' && (
             <motion.div key="logistics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100">
                   <div className="flex items-center justify-between mb-12">
                      <div>
                         <h2 className="text-2xl font-black text-slate-950 tracking-tight">Live Supply Radar</h2>
                         <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Satellite Telemetry Enabled • {stats.transit} Lots Move</p>
                      </div>
                      <button className="h-14 px-8 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-slate-100 transition-all"><Download size={18} /> GENERATE MANIFEST</button>
                   </div>
                   <div className="space-y-16">
                      {stats.transitItems.length > 0 ? (
                        stats.transitItems.map(c => (
                           <LogisticsTrack key={c.id} title={`Bulk Lot - ${c.crop}`} status={c.status} location={c.origin || "Pickup Point"} progress={65} time="ETA 6h 30m" />
                        ))
                      ) : (
                        <div className="py-24 text-center">
                           <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200"><Truck size={40} /></div>
                           <p className="text-slate-400 font-bold">Your supply chain is currently quiet. Begin sourcing to see live tracks.</p>
                        </div>
                      )}
                   </div>
                </div>
             </motion.div>
           )}

           {activeTab === 'contracts' && (
              <motion.div key="contracts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                 <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-black text-slate-950 mb-6">Agreement Vault</h2>
                    {contracts.map(c => <ContractStrip key={c.id} contract={c} />)}
                    {contracts.length === 0 && <div className="p-16 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center text-slate-400 font-bold">Vault is empty. No active agreements.</div>}
                 </div>
                 <div className="space-y-6">
                    <div className="bg-slate-950 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 -mr-12 -mt-12 opacity-10"><ShieldCheck size={240} /></div>
                       <h3 className="text-2xl font-black mb-4 relative z-10">Verification Protocol</h3>
                       <p className="text-slate-400 text-sm font-bold leading-relaxed relative z-10 mb-10">All contracts are protected by 256-bit encryption. Requires physical or biometric authorization for signatures.</p>
                       <button className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/50 transition-all active:scale-95">REQUEST NEW AUDIT</button>
                    </div>
                 </div>
              </motion.div>
           )}

           {activeTab === 'analytics' && (
             <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnalyticsPanel title="Procurement Efficiency" value="94.2%" desc="Calculated against target volume quotas." trend="+5.1%" icon={Layers} />
                <AnalyticsPanel title="Sourcing Liquidity" value={stats.spent} desc="Available funds in verified escrow accounts." trend="Stable" icon={CreditCard} />
                <AnalyticsPanel title="Vendor Compliance" value="A+" desc="Average rating of farmers in your network." trend="Premium" icon={CheckCircle2} />
                <AnalyticsPanel title="Supply Chain Health" value="Optimal" desc="Real-time latency in your logistics chain." trend="Low Latency" icon={Zap} />
             </motion.div>
           )}
        </AnimatePresence>

        {/* BID BIOMETRIC MODAL */}
        <AnimatePresence>
           {selectedAuction && (
             <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAuction(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
                <motion.div initial={{ y: "100%", scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: "100%", scale: 0.9 }} className="relative w-full max-w-xl bg-white rounded-t-[3rem] md:rounded-[3.5rem] p-10 md:p-14 shadow-3xl">
                   <div className="flex justify-between items-start mb-12">
                      <div>
                         <div className="inline-flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-3 uppercase tracking-widest">Authorized Sourcing</div>
                         <h3 className="text-3xl font-black text-slate-900 leading-none uppercase">{selectedAuction.residueType}</h3>
                         <p className="text-xs font-bold text-slate-400 mt-3">{selectedAuction.quantityTons} TONS • LOT #{selectedAuction.id?.slice(-8)}</p>
                      </div>
                      <button onClick={() => setSelectedAuction(null)} className="h-12 w-12 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reserved Index</p>
                         <p className="text-2xl font-black text-slate-900">{formatPrice(selectedAuction.basePriceTotal, "en-IN")}</p>
                      </div>
                      <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Active High</p>
                         <p className="text-2xl font-black text-emerald-900 font-tabular">{formatPrice(selectedAuction.highestBidTotal || selectedAuction.basePriceTotal, "en-IN")}</p>
                      </div>
                   </div>

                   <div className="space-y-6 mb-12">
                      <div className="flex items-center justify-between px-2">
                         <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ALLOCATE BID CAPITAL</p>
                         <p className="text-[11px] font-black text-emerald-600">FUNDS AVAILABLE</p>
                      </div>
                      <div className="relative group">
                         <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-emerald-500 transition-colors">₹</span>
                         <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-[2rem] py-8 pl-14 pr-8 text-4xl font-black text-slate-950 outline-none transition-all shadow-inner" />
                      </div>
                   </div>

                   <button onClick={submitBid} className="group relative w-full py-8 bg-slate-950 text-white rounded-[2.2rem] font-black text-xl shadow-2xl shadow-slate-900/60 active:scale-95 transition-all overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <span className="relative z-10 flex items-center justify-center gap-3">CONFIRM CAPITAL ALLOCATION <MousePointer2 size={24} /></span>
                   </button>
                </motion.div>
             </div>
           )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  );
}

// 💠 HIGH-FIBER STRATEGIC COMPONENTS
function KPICard({ title, value, trend, icon: Icon, color, desc }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-emerald-500/20 transition-all hover:shadow-2xl hover:shadow-slate-200/50">
       <div className="flex items-start justify-between mb-8">
          <div className={`h-12 w-12 md:h-16 md:w-16 rounded-[1.2rem] md:rounded-[1.8rem] bg-${color}-50 text-${color}-600 flex items-center justify-center transition-transform group-hover:rotate-6`}><Icon size={24} className="md:w-8 md:h-8" /></div>
          <div className={`px-4 py-1.5 bg-${color}-50 text-${color}-700 text-[10px] font-black rounded-full border border-${color}-100 uppercase tracking-tighter`}>{trend}</div>
       </div>
       <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">{title}</p>
          <p className="text-2xl md:text-3xl font-black text-slate-950 tracking-tighter leading-none truncate pt-1">{value}</p>
          <p className="text-[10px] font-bold text-slate-300 pt-3">{desc}</p>
       </div>
    </div>
  );
}

function AuctionCard({ auction: a, onBid }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] group hover:shadow-3xl hover:shadow-emerald-900/5 transition-all relative overflow-hidden">
       <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-5 group-hover:opacity-20 transition-opacity"><PackageOpen size={100} /></div>
       <div className="flex items-center justify-between mb-8 relative z-10">
          <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-widest leading-none">LOT #{a.id?.slice(-6)}</span>
          <div className="flex gap-1">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/30" />
          </div>
       </div>
       <div className="relative z-10">
          <h4 className="text-2xl font-black text-slate-950 leading-tight mb-2 truncate uppercase tracking-tighter">{a.residueType}</h4>
          <p className="text-[11px] font-bold text-slate-400 mb-8 flex items-center gap-1.5"><MapPin size={12} className="text-emerald-500" /> {a.location?.split(',')[0]} • {a.quantityTons} TONS AVAILABLE</p>
       </div>
       <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
          <div className="p-5 bg-slate-50 rounded-2xl group-hover:bg-slate-100/50 transition-colors">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Base Rate</p>
              <p className="text-lg font-black text-slate-950 leading-none">{formatPrice(a.basePriceTotal, "en-IN")}</p>
          </div>
          <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
              <p className="text-[9px] font-black text-emerald-600 uppercase mb-1.5 tracking-widest">Last Bid</p>
              <p className="text-lg font-black text-emerald-900 font-tabular leading-none">{formatPrice(a.highestBidTotal || a.basePriceTotal, "en-IN")}</p>
          </div>
       </div>
       <button onClick={onBid} className="relative z-10 w-full py-5 bg-slate-950 text-white rounded-[1.2rem] text-xs font-black flex items-center justify-center gap-3 group-hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-slate-900/10">
          PARTICIPATE BID <ArrowUpRight size={18} />
       </button>
    </div>
  );
}

function LogisticsTrack({ title, status, location, progress, time }) {
  return (
     <div className="flex items-center gap-8 group">
        <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 shadow-inner group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all"><Truck size={40} /></div>
        <div className="flex-1 min-w-0">
           <div className="flex justify-between items-end mb-4">
              <div>
                 <h4 className="text-lg font-black text-slate-950 tracking-tight mb-1">{title}</h4>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{status}</p>
                 </div>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> {time}</span>
           </div>
           <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-3 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 animate-pulse" />
              <div className="h-full bg-emerald-600 rounded-full relative transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.3)]" style={{ width: `${progress}%` }} />
           </div>
           <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><MapPin size={12} /> {location}</p>
        </div>
        <button className="h-14 w-14 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-emerald-600 hover:border-emerald-200 transition-all shrink-0"><ChevronRight size={24} /></button>
     </div>
  );
}

function ContractStrip({ contract: c }) {
  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center gap-8 hover:shadow-xl hover:border-emerald-500/10 transition-all group">
       <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-sm ${c.status === 'signed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}><Handshake size={44} /></div>
       <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <ShieldCheck size={14} className="text-emerald-600" />
             <h4 className="text-lg font-black text-slate-950 tracking-tight">Institutional Agreement #{c.id?.slice(-8)}</h4>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{c.crop} • {c.quantity} Units • {c.farmer_name || "Verified Source"}</p>
       </div>
       <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">STATUS</p>
             <p className={`text-xs font-black uppercase ${c.status === 'signed' ? 'text-emerald-600' : 'text-amber-600'}`}>{c.status}</p>
          </div>
          <button className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${c.status === 'signed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-950 text-white shadow-xl shadow-slate-900/20 active:scale-95'}`}>
             {c.status === 'signed' ? 'VIEW VERIFIED' : 'REQUEST SIGN'}
          </button>
       </div>
    </div>
  );
}

function AnalyticsPanel({ title, value, desc, trend, icon: Icon }) {
  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all">
       <div className="flex items-start justify-between mb-10">
          <div className="h-16 w-16 rounded-[1.8rem] bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition-all"><Icon size={32} /></div>
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">{trend}</div>
       </div>
       <h3 className="text-xl font-black text-slate-950 mb-3">{title}</h3>
       <p className="text-4xl font-black text-slate-950 tracking-tighter mb-6">{value}</p>
       <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-[200px]">{desc}</p>
    </div>
  );
}

function Badge({ label, dot }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 text-white rounded-full shadow-lg shadow-slate-400/20">
       <div className={`h-1.5 w-1.5 rounded-full ${dot} animate-pulse`} />
       <span className="text-[9px] font-black uppercase tracking-[0.1em]">{label}</span>
    </div>
  );
}
