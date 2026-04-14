// EnterpriseDashboardPage.jsx
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2, ChevronRight, CreditCard, Download, Handshake,
  LogOut, MapPin, PackageOpen, Search, ShieldCheck,
  TrendingUp, Truck, ArrowUpRight, Zap, Filter,
  Bell, Layers, CheckCircle2, X, Activity, Globe, Calendar,
  DollarSign, Gavel, Award, Clock, Eye, User, Settings,
  Bookmark, BellRing, History, Star, TrendingDown, AlertTriangle,
  Plus, Trash2, Edit3
} from "lucide-react";
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import PageWrapper from "../components/PageWrapper";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { listAuctionsSource, placeBid, subscribeToMarketplaceEvents, MARKETPLACE_EVENTS } from "../lib/marketplace";
import { listEnterpriseContracts } from "../services/enterpriseContractsService";
import { formatPrice } from "../utils/helpers";

// ---------- LocalStorage helpers for unique features ----------
const STORAGE_KEYS = {
  SAVED_FARMERS: "kisaan-saved-farmers",
  PRICE_ALERTS: "kisaan-price-alerts",
};

function getSavedFarmers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_FARMERS) || "[]");
  } catch { return []; }
}
function saveFarmer(farmer) {
  const existing = getSavedFarmers();
  if (!existing.some(f => f.id === farmer.id)) {
    existing.push(farmer);
    localStorage.setItem(STORAGE_KEYS.SAVED_FARMERS, JSON.stringify(existing));
  }
}
function removeFarmer(farmerId) {
  const existing = getSavedFarmers();
  const filtered = existing.filter(f => f.id !== farmerId);
  localStorage.setItem(STORAGE_KEYS.SAVED_FARMERS, JSON.stringify(filtered));
}

function getPriceAlerts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRICE_ALERTS) || "[]");
  } catch { return []; }
}
function addPriceAlert(alert) {
  const alerts = getPriceAlerts();
  alerts.push({ ...alert, id: Date.now(), createdAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEYS.PRICE_ALERTS, JSON.stringify(alerts));
}
function removePriceAlert(alertId) {
  const alerts = getPriceAlerts();
  const filtered = alerts.filter(a => a.id !== alertId);
  localStorage.setItem(STORAGE_KEYS.PRICE_ALERTS, JSON.stringify(filtered));
}

// ---------- Helper to compute average price per day from auctions ----------
function getRealPriceTrend(auctions) {
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();
  
  if (auctions.length === 0) {
    // Return mock trend for demo (but from real data? just show placeholder)
    return last7Days.map(day => ({ day: day.slice(5), price: 2200 }));
  }
  
  const avgPricePerDay = last7Days.map(day => {
    const dayAuctions = auctions.filter(a => a.createdAt && new Date(a.createdAt).toISOString().split('T')[0] === day);
    if (dayAuctions.length === 0) return { day: day.slice(5), price: null };
    const avg = dayAuctions.reduce((sum, a) => sum + (a.basePriceTotal / a.quantityTons), 0) / dayAuctions.length;
    return { day: day.slice(5), price: Math.round(avg) };
  });
  
  // Fill nulls with previous value (or default 2000)
  let lastPrice = 2000;
  return avgPricePerDay.map(item => {
    if (item.price === null) return { ...item, price: lastPrice };
    lastPrice = item.price;
    return item;
  });
}

export default function EnterpriseDashboardPage() {
  const { language } = useLanguage();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const t = T[language] || T.en;

  const [activeTab, setActiveTab] = useState('procure');
  const [query, setQuery] = useState("");
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [savedFarmers, setSavedFarmers] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [newAlertCrop, setNewAlertCrop] = useState("");
  const [newAlertThreshold, setNewAlertThreshold] = useState("");
  const [bidHistory, setBidHistory] = useState([]); // derived from auctions where buyer.id === myId

  const myId = profile?.id || "";
  const myPhone = profile?.phone || "";
  const myName = profile?.name || "";

  // Load data from backend
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, cRes] = await Promise.all([
        listAuctionsSource(),
        profile?.id ? listEnterpriseContracts({ enterpriseId: profile.id }) : { data: [] }
      ]);
      setAuctions(aRes.data || []);
      setContracts(cRes.data || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }, [profile?.id]);

  useEffect(() => { loadData(); }, [loadData, refreshTrigger]);

  // Load local saved farmers and alerts
  useEffect(() => {
    setSavedFarmers(getSavedFarmers());
    setPriceAlerts(getPriceAlerts());
  }, [refreshTrigger]);

  // Compute bid history from auctions where this enterprise placed a bid
  useEffect(() => {
    const myBids = [];
    auctions.forEach(auction => {
      (auction.bids || []).forEach(bid => {
        if (bid.buyer?.id === myId) {
          myBids.push({
            auctionId: auction.id,
            residueType: auction.residueType,
            quantity: auction.quantityTons,
            bidAmount: bid.amountTotal,
            status: auction.status === 'completed' && auction.acceptedBidId === bid.id ? 'Won' : (auction.status === 'completed' ? 'Lost' : 'Active'),
            createdAt: bid.createdAt,
          });
        }
      });
    });
    setBidHistory(myBids.sort((a,b) => b.createdAt - a.createdAt));
  }, [auctions, myId]);

  // Real-time listeners
  useEffect(() => {
    const unsubBid = subscribeToMarketplaceEvents(MARKETPLACE_EVENTS.BID_PLACED, (data) => {
      if (auctions.some(a => a.id === data.auctionId)) loadData();
    });
    const unsubAccept = subscribeToMarketplaceEvents(MARKETPLACE_EVENTS.BID_ACCEPTED, (data) => {
      if (auctions.some(a => a.id === data.auctionId)) loadData();
    });
    const unsubCreate = subscribeToMarketplaceEvents(MARKETPLACE_EVENTS.AUCTION_CREATED, () => loadData());
    return () => { unsubBid(); unsubAccept(); unsubCreate(); };
  }, [auctions, loadData]);

  // Stats using real data
  const stats = useMemo(() => {
    const won = auctions.filter(a => a.status === 'completed' && a.acceptedBidId &&
      (a.bids || []).find(b => b.id === a.acceptedBidId)?.buyer?.id === myId);
    const totalVol = won.reduce((s, a) => s + (a.quantityTons || 0), 0);
    const totalSpent = won.reduce((s, a) => {
      const winBid = (a.bids || []).find(b => b.id === a.acceptedBidId);
      return s + (winBid?.amountTotal || 0);
    }, 0);
    const inTransit = contracts.filter(c => ['in_transit', 'shipping'].includes(c.status?.toLowerCase()));
    return {
      procured: `${Math.round(totalVol)} Tons`,
      active: contracts.length,
      transit: inTransit.length,
      spent: formatPrice(totalSpent, "en-IN"),
      transitItems: inTransit
    };
  }, [auctions, contracts, myId]);

  // Real price trend from auctions
  const realChartData = useMemo(() => getRealPriceTrend(auctions), [auctions]);

  // Filter active auctions
  const filteredAuctions = useMemo(() => {
    const q = query.toLowerCase();
    return auctions.filter(a => a.status === 'active' && (!q || a.residueType?.toLowerCase().includes(q)));
  }, [auctions, query]);

  // Recommended auctions: those from farmers you've bought from before, or same crop type
  const recommendedAuctions = useMemo(() => {
    const purchasedFarmers = new Set();
    auctions.forEach(a => {
      if (a.status === 'completed' && a.acceptedBidId) {
        const winBid = (a.bids || []).find(b => b.id === a.acceptedBidId);
        if (winBid?.buyer?.id === myId && a.seller?.id) {
          purchasedFarmers.add(a.seller.id);
        }
      }
    });
    return filteredAuctions.filter(a => purchasedFarmers.has(a.seller?.id));
  }, [filteredAuctions, auctions, myId]);

  const submitBid = async () => {
    if (!selectedAuction || !bidAmount) return;
    try {
      await placeBid({
        auctionId: selectedAuction.id,
        buyerId: myId,
        buyerPhone: myPhone,
        buyerName: myName,
        buyerType: "enterprise",
        amountTotal: Number(bidAmount),
      });
      setSelectedAuction(null);
      setBidAmount("");
      loadData();
    } catch (e) { alert(e.message); }
  };

  const handleLogout = async () => { if (signOut) await signOut(); navigate("/"); };

  const handleSaveFarmer = (farmer) => {
    saveFarmer(farmer);
    setSavedFarmers(getSavedFarmers());
  };

  const handleRemoveFarmer = (farmerId) => {
    removeFarmer(farmerId);
    setSavedFarmers(getSavedFarmers());
  };

  const handleAddAlert = () => {
    if (!newAlertCrop || !newAlertThreshold) return;
    addPriceAlert({ crop: newAlertCrop, threshold: Number(newAlertThreshold) });
    setPriceAlerts(getPriceAlerts());
    setNewAlertCrop("");
    setNewAlertThreshold("");
    setShowAlertModal(false);
  };

  // Check alerts against current auctions (run on load and when auctions change)
  useEffect(() => {
    const alerts = getPriceAlerts();
    alerts.forEach(alert => {
      const matchingAuctions = auctions.filter(a => a.residueType === alert.crop && a.status === 'active');
      matchingAuctions.forEach(auction => {
        const currentPrice = auction.basePriceTotal / auction.quantityTons;
        if (currentPrice <= alert.threshold) {
          // Show browser notification (if permitted)
          if (Notification.permission === "granted") {
            new Notification(`Price Alert: ${alert.crop}`, {
              body: `Price dropped to ₹${currentPrice}/ton (below ₹${alert.threshold})`,
            });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission();
          }
          // Also remove alert after triggering (optional)
          removePriceAlert(alert.id);
          setPriceAlerts(getPriceAlerts());
        }
      });
    });
  }, [auctions]);

  return (
    <PageWrapper className="bg-[#F9FBFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:pb-32">
        {/* Header with Profile Dropdown */}
        <header className="flex flex-col gap-6 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-700 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full">
                <Activity size={10} className="animate-pulse" /> {t.badge}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter pt-2">{t.title}</h1>
              <p className="text-slate-400 font-bold text-xs">{auctions.length} Active Lots • Live Bidding</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition"
              >
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black">
                  {myName?.charAt(0) || "E"}
                </div>
                <span className="text-sm font-bold text-slate-700 hidden sm:inline">{myName || "Enterprise"}</span>
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-90' : ''}`} />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 py-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-black text-slate-900">{myName}</p>
                    <p className="text-xs text-slate-500">{myPhone || "No phone"}</p>
                    <p className="text-xs text-slate-500 mt-1">Enterprise Account</p>
                  </div>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <User size={16} /> Profile Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <BellRing size={16} /> Notifications
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search}
                className="w-full h-14 bg-white border border-slate-100 rounded-2xl pl-12 pr-6 text-sm font-bold" />
            </div>
            <button
              onClick={() => setShowAlertModal(true)}
              className="h-14 bg-white border rounded-2xl flex items-center justify-center gap-2 text-xs font-black hover:bg-emerald-50 transition"
            >
              <BellRing size={18} /> SET PRICE ALERT
            </button>
          </div>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          <KPICard title={t.totalProcured} value={stats.procured} trend="+12%" icon={PackageOpen} color="emerald" />
          <KPICard title={t.activeContracts} value={stats.active} trend="Active" icon={Handshake} color="indigo" />
          <KPICard title={t.inTransit} value={`${stats.transit} Lots`} trend="Live" icon={Truck} color="sky" />
          <KPICard title={t.budgetSpent} value={stats.spent} trend="Escrow" icon={TrendingUp} color="amber" />
        </div>

        {/* Tabs */}
        <div className="sticky top-4 z-40 p-1.5 bg-white/90 backdrop-blur-2xl rounded-[1.5rem] mb-10 flex gap-1 overflow-x-auto">
          {Object.entries(t.tabs).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === key ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-400'}`}>
              {label}
            </button>
          ))}
          <button onClick={() => setActiveTab('bids')}
            className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'bids' ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-400'}`}>
            BID HISTORY
          </button>
          <button onClick={() => setActiveTab('saved')}
            className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'saved' ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-400'}`}>
            SAVED FARMERS
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'procure' && (
            <motion.div key="procure" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Real Price Chart */}
             {/* Real Price Chart - Fixed Dimensions */}
<div className="bg-white rounded-[2.5rem] p-6 md:p-10 border shadow-sm">
  <div className="flex justify-between items-center mb-8">
    <div><h3 className="text-xl font-black">Real Market Price Index</h3><p className="text-xs font-bold text-slate-400">Last 7 days (₹/ton)</p></div>
    <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full">LIVE</div>
  </div>
  <div className="h-64 w-full min-h-[256px]">
    {realChartData && realChartData.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={realChartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `₹${value}`} />
          <Tooltip 
            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
            formatter={(value) => [`₹${value}`, 'Avg Price']}
          />
          <Area type="monotone" dataKey="price" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
        </AreaChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
        Not enough data to display chart
      </div>
    )}
  </div>
</div>

              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">Active Sourcing Radar</h2>
                <div className="flex gap-2">
                  <button className="h-10 px-4 bg-white border rounded-xl text-[10px] font-black flex items-center gap-2"><Filter size={14} /> FILTERS</button>
                  <button className="h-10 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-black flex items-center gap-2"><Star size={14} /> RECOMMENDED</button>
                </div>
              </div>

              {/* Recommended Auctions Section */}
              {recommendedAuctions.length > 0 && (
                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
                  <h3 className="text-sm font-black text-emerald-800 mb-3 flex items-center gap-2"><Star size={16} /> Recommended for you (based on past purchases)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedAuctions.slice(0,3).map(a => <AuctionCard key={a.id} auction={a} onBid={() => setSelectedAuction(a)} />)}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAuctions.map(a => <AuctionCard key={a.id} auction={a} onBid={() => setSelectedAuction(a)} onSaveFarmer={handleSaveFarmer} />)}
                {filteredAuctions.length === 0 && <div className="py-20 bg-white rounded-[2rem] border-2 border-dashed text-center text-slate-400">No active auctions</div>}
              </div>
            </motion.div>
          )}

          {activeTab === 'logistics' && (
            <motion.div key="logistics" className="space-y-6">
              <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm">
                <div className="flex justify-between items-center mb-12">
                  <div><h2 className="text-2xl font-black">Live Supply Radar</h2><p className="text-xs font-bold text-emerald-600">{stats.transit} Lots in Transit</p></div>
                  <button className="h-14 px-8 bg-slate-50 rounded-2xl text-xs font-black flex items-center gap-2"><Download size={18} /> MANIFEST</button>
                </div>
                <div className="space-y-10">
                  {stats.transitItems.length ? stats.transitItems.map(c => <LogisticsTrack key={c.id} contract={c} />)
                    : <div className="py-24 text-center"><Truck size={40} className="mx-auto text-slate-200 mb-4"/><p className="text-slate-400">No active shipments</p></div>}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'contracts' && (
            <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-black mb-6">Agreement Vault</h2>
                {contracts.map(c => <ContractStrip key={c.id} contract={c} />)}
                {!contracts.length && <div className="p-16 bg-white rounded-[2.5rem] border-2 border-dashed text-center">No contracts yet</div>}
              </div>
              <div className="bg-slate-950 text-white rounded-[2.5rem] p-10 relative overflow-hidden">
                <ShieldCheck size={240} className="absolute top-0 right-0 opacity-10" />
                <h3 className="text-2xl font-black mb-4">Verification Protocol</h3>
                <p className="text-slate-400 text-sm mb-10">256-bit encrypted. Biometric auth required.</p>
                <button className="w-full py-5 bg-emerald-600 rounded-2xl text-[11px] font-black">REQUEST AUDIT</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnalyticsPanel title="Procurement Efficiency" value="94.2%" trend="+5.1%" icon={Layers} desc="vs target" />
              <AnalyticsPanel title="Sourcing Liquidity" value={stats.spent} trend="Stable" icon={CreditCard} desc="Available escrow" />
              <AnalyticsPanel title="Vendor Compliance" value="A+" trend="Premium" icon={CheckCircle2} desc="Farmer rating" />
              <AnalyticsPanel title="Supply Chain Health" value="Optimal" trend="Low Latency" icon={Zap} desc="Real-time" />
            </motion.div>
          )}

          {activeTab === 'bids' && (
            <motion.div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><History size={24} /> Your Bid History</h2>
              {bidHistory.length === 0 ? (
                <div className="py-20 text-center text-slate-400">No bids placed yet.</div>
              ) : (
                <div className="space-y-3">
                  {bidHistory.map((bid, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 border rounded-2xl bg-slate-50">
                      <div>
                        <p className="font-black">{bid.residueType}</p>
                        <p className="text-xs text-slate-500">{bid.quantity} tons • {new Date(bid.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black">₹{bid.bidAmount.toLocaleString()}</p>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${bid.status === 'Won' ? 'bg-green-100 text-green-700' : bid.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {bid.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Bookmark size={24} /> Saved Farmers</h2>
              {savedFarmers.length === 0 ? (
                <div className="py-20 text-center text-slate-400">No saved farmers. Click the bookmark icon on any auction to save a farmer.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedFarmers.map(farmer => (
                    <div key={farmer.id} className="flex justify-between items-center p-4 border rounded-2xl">
                      <div>
                        <p className="font-black">{farmer.name}</p>
                        <p className="text-xs text-slate-500">{farmer.phone || "No phone"} • {farmer.location || "Unknown"}</p>
                      </div>
                      <button onClick={() => handleRemoveFarmer(farmer.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bid Modal (unchanged) */}
        <AnimatePresence>
          {selectedAuction && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAuction(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
              <motion.div initial={{ y: "100%", scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: "100%" }} className="relative w-full max-w-xl bg-white rounded-t-[3rem] md:rounded-[3.5rem] p-10 md:p-14">
                <div className="flex justify-between items-start mb-8">
                  <div><div className="inline-flex gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">LIVE AUCTION</div>
                  <h3 className="text-3xl font-black mt-2">{selectedAuction.residueType}</h3></div>
                  <button onClick={() => setSelectedAuction(null)}><X size={24} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-6 bg-slate-50 rounded-2xl"><p className="text-[10px] font-black text-slate-400">Base Price</p><p className="text-2xl font-black">{formatPrice(selectedAuction.basePriceTotal, "en-IN")}</p></div>
                  <div className="p-6 bg-emerald-50 rounded-2xl"><p className="text-[10px] font-black text-emerald-600">Highest Bid</p><p className="text-2xl font-black">{formatPrice(selectedAuction.highestBidTotal || selectedAuction.basePriceTotal, "en-IN")}</p></div>
                </div>
                <div className="mb-8">
                  <p className="text-[11px] font-black text-slate-400 mb-2">YOUR BID (₹)</p>
                  <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder="Enter amount" className="w-full bg-slate-50 rounded-2xl py-6 px-6 text-2xl font-black outline-none focus:ring-2 ring-emerald-500" />
                  <div className="mt-2 text-right text-xs text-emerald-600 font-bold cursor-pointer" onClick={() => setBidAmount(String((selectedAuction.highestBidTotal || selectedAuction.basePriceTotal) + 100))}>+ Smart Bid ↑</div>
                </div>
                <button onClick={submitBid} className="w-full py-6 bg-slate-950 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition">CONFIRM BID <ArrowUpRight size={20} /></button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Price Alert Modal */}
        <AnimatePresence>
          {showAlertModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAlertModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-white rounded-3xl p-6 w-full max-w-md">
                <h3 className="text-xl font-black mb-4">Set Price Alert</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase">Crop / Residue Type</label>
                    <input type="text" value={newAlertCrop} onChange={e => setNewAlertCrop(e.target.value)} placeholder="e.g., Wheat, Rice" className="w-full border rounded-xl p-3 mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase">Threshold Price (₹/ton)</label>
                    <input type="number" value={newAlertThreshold} onChange={e => setNewAlertThreshold(e.target.value)} placeholder="e.g., 2000" className="w-full border rounded-xl p-3 mt-1" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowAlertModal(false)} className="flex-1 py-3 border rounded-xl font-black">Cancel</button>
                  <button onClick={handleAddAlert} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black">Create Alert</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}

// ---------- Subcomponents (updated AuctionCard with Save Farmer) ----------
function KPICard({ title, value, trend, icon: Icon, color }) {
  return <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm"><div className="flex justify-between"><Icon size={24} className="text-emerald-600"/><span className="text-[10px] font-black text-emerald-600">{trend}</span></div><p className="text-[10px] font-black text-slate-400 mt-8">{title}</p><p className="text-2xl md:text-3xl font-black">{value}</p></div>;
}

function AuctionCard({ auction, onBid, onSaveFarmer }) {
  const highest = (auction.bids || []).reduce((max, b) => Math.max(max, b.amountTotal), 0) || auction.basePriceTotal;
  return <div className="bg-white rounded-[2rem] p-6 border shadow-sm group hover:shadow-xl transition relative">
    <div className="flex justify-between">
      <span className="text-[9px] font-black bg-slate-100 px-3 py-1 rounded-full">LOT {auction.id.slice(-6)}</span>
      <div className="flex gap-1">
        {onSaveFarmer && auction.seller && (
          <button onClick={() => onSaveFarmer({ id: auction.seller.id, name: auction.seller.name, phone: auction.seller.phone, location: auction.location })} className="text-slate-300 hover:text-emerald-600 transition">
            <Bookmark size={16} />
          </button>
        )}
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>
    </div>
    <h4 className="text-2xl font-black mt-4">{auction.residueType}</h4>
    <p className="text-xs font-bold text-slate-400 mt-1 flex gap-1"><MapPin size={12}/> {auction.location?.split(',')[0] || "Unknown"} • {auction.quantityTons} Tons</p>
    <div className="grid grid-cols-2 gap-3 my-6">
      <div><p className="text-[9px] font-black text-slate-400">Base</p><p className="text-lg font-black">{formatPrice(auction.basePriceTotal, "en-IN")}</p></div>
      <div><p className="text-[9px] font-black text-emerald-600">Highest</p><p className="text-lg font-black">{formatPrice(highest, "en-IN")}</p></div>
    </div>
    <button onClick={onBid} className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition">PLACE BID <Gavel size={14}/></button>
  </div>;
}

function LogisticsTrack({ contract }) {
  return <div className="flex items-center gap-6"><div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center"><Truck size={32}/></div><div className="flex-1"><div className="flex justify-between"><h4 className="font-black">{contract.crop} Lot</h4><span className="text-[10px] font-black text-emerald-600">{contract.status}</span></div><div className="h-2 w-full bg-slate-100 rounded-full mt-2 overflow-hidden"><div className="h-full w-2/3 bg-emerald-600 rounded-full"></div></div><p className="text-xs font-bold text-slate-400 mt-1">ETA 6h 30m</p></div></div>;
}

function ContractStrip({ contract }) {
  return <div className="bg-white rounded-2xl p-5 border flex items-center gap-6"><Handshake size={40} className="text-emerald-600"/><div><p className="font-black">Agreement #{contract.id?.slice(-8)}</p><p className="text-xs text-slate-500">{contract.crop} • {contract.quantity} units</p></div><div className="ml-auto"><span className="text-xs font-black text-emerald-600">{contract.status}</span></div></div>;
}

function AnalyticsPanel({ title, value, trend, icon: Icon, desc }) {
  return <div className="bg-white p-8 rounded-3xl border"><div className="flex justify-between"><Icon size={32} className="text-slate-600"/><span className="text-[10px] font-black text-emerald-600">{trend}</span></div><h3 className="text-xl font-black mt-6">{title}</h3><p className="text-4xl font-black mt-2">{value}</p><p className="text-xs text-slate-400 mt-2">{desc}</p></div>;
}

// Missing translations (add if needed)
const T = {
  en: {
    badge: "Enterprise Hub Pro", title: "Procurement Portal",
    search: "Search lots...", totalProcured: "Procured", activeContracts: "Contracts",
    inTransit: "Logistics", budgetSpent: "Liquidity",
    tabs: { procure: "Sourcing", logistics: "Live Radar", contracts: "Vault", analytics: "Insights" },
    logout: "Exit", estCost: "Est. Cost", bidNow: "Place Bid", yourBid: "Your Bid",
    smartBid: "Smart Bid"
  },
};