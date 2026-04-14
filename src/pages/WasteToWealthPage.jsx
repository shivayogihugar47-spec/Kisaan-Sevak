import { AnimatePresence, motion } from "framer-motion";
import { Award, CheckCircle2, Clock, DollarSign, Gavel, Leaf, Loader2, ShoppingCart, TrendingUp } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import PageWrapper from "../components/PageWrapper";
import SelectField from "../components/SelectField";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { residueBuyers } from "../data/mockData";
import { createAuction, listAuctionsSource, acceptBid, subscribeToMarketplaceEvents, MARKETPLACE_EVENTS } from "../lib/marketplace";
import { formatPrice } from "../utils/helpers";

const residueIds = Object.keys(residueBuyers);

export default function WasteToWealthPage() {
  const { content } = useLanguage();
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState('new_sell');
  const [residueType, setResidueType] = useState(residueIds[0]);
  const [quantity, setQuantity] = useState(1);
  const [sellMethod, setSellMethod] = useState('instant');
  const [basePrice, setBasePrice] = useState("");
  const [duration, setDuration] = useState("24h");
  const [myListings, setMyListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const residueOptions = residueIds.map(id => ({ value: id, label: content.waste?.residueOptions?.[id] || id }));

  const loadMyListings = useCallback(async () => {
    if (activeTab !== "my_listings") return;
    const userId = profile?.id;
    const userPhone = profile?.phone;
    const userName = profile?.name;
    if (!userId && !userPhone && !userName) {
      console.warn("No user info found");
      return;
    }
    setIsLoading(true);
    try {
      const res = await listAuctionsSource();
      console.log("All auctions:", res.data);
      
      // Filter by seller.id, seller.phone, OR seller.name
      const my = (res.data || []).filter(a => {
        const seller = a?.seller || {};
        if (userId && seller.id === userId) return true;
        if (userPhone && seller.phone === userPhone) return true;
        if (userName && seller.name === userName) return true;
        return false;
      }).map(a => ({
        id: a.id,
        type: a.residueType,
        quantity: a.quantityTons,
        basePrice: a.basePriceTotal,
        highestBid: (a.bids || []).reduce((max, b) => Math.max(max, Number(b.amountTotal)), 0) || null,
        bids: a.bids || [],
        acceptedBidId: a.acceptedBidId,
        timeRemaining: a.status === "active" ? "Active" : "Sold",
        bidders: (a.bids || []).length,
        status: a.status,
        auctionId: a.id,
      }));
      console.log("My listings after filter:", my);
      setMyListings(my);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, profile?.id, profile?.phone, profile?.name]);

  useEffect(() => {
    loadMyListings();
  }, [loadMyListings, refreshTrigger]);

  // Real-time updates
  useEffect(() => {
    const unsubBid = subscribeToMarketplaceEvents(MARKETPLACE_EVENTS.BID_PLACED, (data) => {
      if (myListings.some(l => l.auctionId === data.auctionId)) loadMyListings();
    });
    const unsubAccept = subscribeToMarketplaceEvents(MARKETPLACE_EVENTS.BID_ACCEPTED, (data) => {
      if (myListings.some(l => l.auctionId === data.auctionId)) loadMyListings();
    });
    const unsubCreate = subscribeToMarketplaceEvents(MARKETPLACE_EVENTS.AUCTION_CREATED, () => {
      if (activeTab === 'my_listings') loadMyListings();
    });
    return () => { unsubBid(); unsubAccept(); unsubCreate(); };
  }, [myListings, loadMyListings, activeTab]);

  const buyers = residueBuyers[residueType] || [];
  const bestBuyer = buyers.length ? [...buyers].sort((a, b) => b.price - a.price)[0] : null;

  const handleInstantSell = () => {
    setIsProcessing(true);
    setTimeout(() => { setIsProcessing(false); setConfirmed(true); }, 1500);
  };

  const handleListForBid = async () => {
    if (!basePrice || basePrice <= 0) return;
    setIsProcessing(true);
    try {
      const allowedBuyerTypes = [...new Set(buyers.map(b => b.type).filter(Boolean))];
      await createAuction({
        sellerId: profile?.id,
        sellerPhone: profile?.phone || "",
        sellerName: profile?.name || "",
        residueType,
        quantityTons: quantity,
        basePriceTotal: parseFloat(basePrice),
        durationHours: duration === "24h" ? 24 : duration === "3d" ? 72 : 168,
        allowedBuyerTypes,
      });
      setConfirmed(true);
      setRefreshTrigger(r => r + 1);
    } catch (e) { 
      console.error(e);
      alert("Failed to create auction: " + e.message);
    }
    setIsProcessing(false);
  };

  const handleAcceptBid = async (auctionId, bidId) => {
    try {
      await acceptBid({ auctionId, bidId });
      setRefreshTrigger(r => r + 1);
    } catch (e) { alert(e.message); }
  };

  // UI rendering (same as before, no changes)
  return (
    <PageWrapper>
      <Header title="Waste to Wealth" subtitle="Sell crop residue" location={content.locationLabel} showBack maxWidth="max-w-6xl" />
      <div className="relative mx-auto mt-4 max-w-6xl px-5 pb-12 md:px-8">
        <div className="relative mb-6 overflow-hidden rounded-[32px] border bg-white/85 p-6 backdrop-blur md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">Carbon-smart marketplace</p>
              <h2 className="mt-1 font-display text-3xl font-black">Waste to Wealth Exchange</h2>
              <p className="mt-1.5 text-sm font-semibold text-slate-600">Sell residue instantly or launch a competitive auction.</p>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <StatPill label="Buyers" value={buyers.length} tone="emerald" />
              <StatPill label="Qty" value={`${quantity}t`} tone="indigo" />
              <StatPill label="CO2 Saved" value={`${(quantity * 1.5).toFixed(1)}t`} tone="amber" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-2 rounded-[24px] border bg-white/90 p-1.5">
          <button onClick={() => { setActiveTab('new_sell'); setConfirmed(false); }} className={`flex-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${activeTab === 'new_sell' ? 'bg-slate-950 text-white' : 'text-slate-700'}`}><ShoppingCart size={18} /> Sell Residue</button>
          <button onClick={() => { setActiveTab('my_listings'); setConfirmed(false); loadMyListings(); }} className={`flex-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${activeTab === 'my_listings' ? 'bg-slate-950 text-white' : 'text-slate-700'}`}><Gavel size={18} /> My Listings</button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'new_sell' && (
            <motion.div key="new_sell" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <div className="space-y-5">
                <Card className="rounded-[30px] border bg-white shadow-sm">
                  <div className="flex justify-between"><div><p className="text-[11px] font-black uppercase text-slate-500">Waste to Wealth</p><h3 className="text-2xl font-black">Select residue</h3></div><span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black"><Award size={14} /> Premium market</span></div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <SelectField label="Residue Type" value={residueType} onChange={e => setResidueType(e.target.value)} options={residueOptions} />
                    <div><span className="mb-2 block text-sm font-semibold">Quantity (Tons)</span><div className="flex items-center gap-2 rounded-2xl border bg-slate-50 p-2"><button onClick={() => setQuantity(Math.max(1, quantity-1))} className="h-10 w-10 rounded-xl bg-white ring-1 ring-slate-200">-</button><input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} className="w-full text-center font-black outline-none" /><button onClick={() => setQuantity(quantity+1)} className="h-10 w-10 rounded-xl bg-white ring-1 ring-slate-200">+</button></div></div>
                  </div>
                  <div className="mt-6 border-t pt-5"><p className="mb-3 text-sm font-semibold">Sale method</p><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setSellMethod("instant")} className={`rounded-2xl border p-4 text-left transition ${sellMethod === "instant" ? "border-emerald-300 bg-emerald-50" : "bg-white"}`}><div className="flex items-start gap-3"><ShoppingCart size={18} /><div><p className="font-black">Instant Sell</p><p className="text-xs text-slate-600">Accept best offer now</p></div></div></button><button onClick={() => setSellMethod("bid")} className={`rounded-2xl border p-4 text-left ${sellMethod === "bid" ? "border-indigo-300 bg-indigo-50" : "bg-white"}`}><div className="flex gap-3"><Gavel size={18} /><div><p className="font-black">Auction</p><p className="text-xs">Let buyers compete</p></div></div></button></div></div>
                </Card>

                {confirmed ? (
                  <Card className="rounded-[30px] bg-gradient-to-r from-emerald-900 to-slate-900 text-white"><div className="flex items-start gap-4"><CheckCircle2 size={30} /><div><h3 className="text-2xl font-black">Listing Published!</h3><p>Your {quantity} tons of {residueType} is now live for bidding.</p><div className="mt-4 rounded-2xl bg-white/10 p-4"><p className="text-xs font-black uppercase">CO2 prevented</p><p className="text-sm font-bold">{(quantity * 1.5).toFixed(1)} tons</p></div><Button className="mt-5 bg-white/20" onClick={() => { setActiveTab('my_listings'); loadMyListings(); }}>View My Listings</Button></div></div></Card>
                ) : sellMethod === "instant" ? (
                  buyers.length ? (
                    <div className="space-y-3"><div className="flex justify-between"><p className="text-sm font-black">Corporate Buyers</p><span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black">{buyers.length} offers</span></div><div className="grid gap-3 md:grid-cols-2">{buyers.map(buyer => <InstantBuyerCard key={buyer.name} buyer={buyer} quantity={quantity} isBest={buyer.name === bestBuyer?.name} />)}</div><Button className="w-full bg-emerald-700 text-white" onClick={handleInstantSell} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin" /> : <>Confirm with {bestBuyer?.name}</>}</Button></div>
                  ) : <EmptyState icon="♻️" title="No buyers" description="Try auction method" />
                ) : (
                  <Card className="rounded-[30px] border bg-white"><div className="flex justify-between"><h3 className="flex items-center gap-2 text-lg font-black"><Gavel size={18} /> Auction Setup</h3><span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-black">B2B</span></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className="text-xs font-black uppercase">Base price (₹)</label><input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="w-full rounded-2xl border bg-slate-50 p-4" placeholder="e.g. 15000" /></div><div><label>Duration</label><div className="flex gap-2 mt-1">{["24h","3d","7d"].map(opt => <button key={opt} onClick={() => setDuration(opt)} className={`flex-1 rounded-xl py-3 text-sm font-black ${duration === opt ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>{opt}</button>)}</div></div></div><Button className="mt-6 w-full bg-indigo-700 text-white" onClick={handleListForBid} disabled={isProcessing || !basePrice}>{isProcessing ? <Loader2 className="animate-spin" /> : <>Publish Auction</>}</Button></Card>
                )}
              </div>
              <div className="space-y-5">
                <Card className="rounded-[30px]"><p className="text-[11px] font-black uppercase">Best offer snapshot</p><p className="text-3xl font-black mt-2">{bestBuyer ? formatPrice(bestBuyer.price * quantity, "en-IN") : "—"}</p><div className="mt-5 grid grid-cols-2 gap-3"><MiniKpi icon={DollarSign} label="Per ton" value={bestBuyer ? formatPrice(bestBuyer.price, "en-IN") : "—"} /><MiniKpi icon={TrendingUp} label="Buyers" value={String(buyers.length)} /></div><div className="mt-5 rounded-2xl bg-emerald-50 p-4"><Leaf size={16} className="text-emerald-700"/><p className="text-xs font-black uppercase mt-1">Impact</p><p>{(quantity * 1.5).toFixed(1)} tons CO2 prevented</p></div></Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'my_listings' && (
            <motion.div key="my_listings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {isLoading ? <LoadingState /> : myListings.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {myListings.map(listing => (
                    <Card key={listing.id} className="relative overflow-hidden rounded-[30px]">
                      {listing.status === 'completed' && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center"><div className="rounded-full bg-slate-900 px-5 py-2 text-white text-sm font-black">SOLD</div></div>}
                      <div className="flex justify-between border-b pb-4"><div><span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded">{listing.id.slice(-8)}</span><h3 className="text-lg font-black capitalize mt-2">{listing.type}</h3><p>{listing.quantity} Tons</p></div><div className="text-right"><span className="inline-flex gap-1 bg-amber-50 px-2 py-1 rounded text-amber-700 text-[10px] font-black"><Clock size={12} /> {listing.timeRemaining}</span><p className="text-[10px] font-black mt-1">{listing.bidders} Bidders</p></div></div>
                      <div className="rounded-2xl bg-slate-50 p-4 my-4"><div className="flex justify-between"><div><p className="text-[10px] font-black uppercase">Base Price</p><p className="text-lg font-black">₹{listing.basePrice.toLocaleString()}</p></div><div className="text-right"><p className="text-[10px] font-black uppercase text-emerald-600">Highest Bid</p><p className="text-xl font-black">{listing.highestBid ? `₹${listing.highestBid.toLocaleString()}` : "—"}</p></div></div></div>
                      {listing.status === "active" && listing.bids?.length > 0 && (
                        <div className="mt-2 rounded-2xl border p-4"><p className="text-[10px] font-black uppercase">Received Bids</p><div className="mt-3 space-y-2">{listing.bids.sort((a,b)=>b.amountTotal-a.amountTotal).slice(0,3).map(bid => <div key={bid.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl"><div><p className="font-black">₹{bid.amountTotal.toLocaleString()}</p><p className="text-[10px] text-slate-500">{bid.buyer?.name || "Buyer"}</p></div><button onClick={() => handleAcceptBid(listing.auctionId, bid.id)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black">Accept</button></div>)}</div></div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : <EmptyState icon="📋" title="No active bids" description="List your residue to start receiving bids." />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}

// Helper components (unchanged)
function StatPill({ label, value, tone }) {
  const colors = { emerald: "border-emerald-200 bg-emerald-50 text-emerald-700", indigo: "border-indigo-200 bg-indigo-50 text-indigo-700", amber: "border-amber-200 bg-amber-50 text-amber-700" };
  return <div className={`rounded-2xl border px-3 py-2 text-center ${colors[tone]}`}><p className="text-[10px] font-black uppercase">{label}</p><p className="text-lg font-black">{value}</p></div>;
}
function MiniKpi({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border bg-white p-4"><div className="flex items-center gap-2"><Icon size={18} className="text-emerald-600"/><div><p className="text-[10px] font-black uppercase">{label}</p><p className="text-sm font-black">{value}</p></div></div></div>;
}
function InstantBuyerCard({ buyer, quantity, isBest }) {
  return <div className={`rounded-2xl border p-4 ${isBest ? 'border-amber-200 bg-amber-50' : 'bg-white'}`}><div className="flex justify-between"><div><p className="font-black">{buyer.name}</p><p className="text-xs">{buyer.type}</p></div><p className="text-xl font-black">₹{buyer.price * quantity}</p></div><div className="flex justify-between mt-2 text-xs"><span>🚚 {buyer.distance}</span><span>₹{buyer.price}/ton</span></div></div>;
}