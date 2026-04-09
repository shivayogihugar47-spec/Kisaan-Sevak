import { AnimatePresence, motion } from "framer-motion";
import { Award, CheckCircle2, Clock, DollarSign, Gavel, Leaf, ListPlus, Loader2, ShoppingCart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
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
import { acceptBid, createAuction, listAuctionsSource } from "../lib/marketplace";
import { formatPrice } from "../utils/helpers";

const residueIds = Object.keys(residueBuyers);

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export default function WasteToWealthPage() {
  const { content } = useLanguage();
  const { profile } = useAuth();

  // --- CORE STATES ---
  const [activeTab, setActiveTab] = useState('new_sell'); // 'new_sell' | 'my_listings'
  const [residueType, setResidueType] = useState(residueIds[0]);
  const [quantity, setQuantity] = useState(1);

  // --- BIDDING STATES ---
  const [sellMethod, setSellMethod] = useState('instant'); // 'instant' | 'bid'
  const [basePrice, setBasePrice] = useState("");
  const [duration, setDuration] = useState("24h");
  const [myListings, setMyListings] = useState([]);
  const [auctionsVersion, setAuctionsVersion] = useState(0);

  // --- UI STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const residueOptions = residueIds.map((residueId) => ({
    value: residueId,
    label: content.waste?.residueOptions?.[residueId] || residueId,
  }));

  useEffect(() => {
    setIsLoading(true);
    setConfirmed(false);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [residueType, sellMethod, activeTab]);

  useEffect(() => {
    // Hydrate farmer listings from shared marketplace (Supabase + local fallback).
    if (activeTab !== "my_listings") return;
    const phone = profile?.phone;
    if (!phone) return;
    let ignore = false;
    async function run() {
      const res = await listAuctionsSource();
      if (ignore) return;
      const auctions = (res.data || [])
        .filter((a) => a?.seller?.phone === phone)
        .map((a) => ({
          id: a.id,
          type: a.residueType,
          quantity: a.quantityTons,
          basePrice: a.basePriceTotal,
          highestBid: (a.bids || []).reduce((max, b) => Math.max(max, Number(b.amountTotal || 0)), 0) || null,
          bids: Array.isArray(a.bids) ? a.bids : [],
          acceptedBidId: a.acceptedBidId || null,
          timeRemaining: a.status === "active" ? "Active" : "Completed",
          bidders: Array.isArray(a.bids) ? a.bids.length : 0,
          status: a.status === "completed" ? "completed" : "active",
          auctionId: a.id,
        }));

      // Keep any legacy demo listings, but prefer the shared ones first.
      setMyListings((prev) => {
        const legacy = (prev || []).filter((p) => String(p.id || "").startsWith("BID-"));
        return [...auctions, ...legacy];
      });
    }
    run();
    return () => {
      ignore = true;
    };
  }, [activeTab, profile?.phone, auctionsVersion]);

  useEffect(() => {
    function refresh() {
      setAuctionsVersion((v) => v + 1);
    }
    function onStorage(e) {
      if (e?.key === "kisaan-sevak-auctions-v1") refresh();
    }
    function onVisibility() {
      if (document.visibilityState === "visible") refresh();
    }
    window.addEventListener("kisaan-sevak-auctions-updated", refresh);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("kisaan-sevak-auctions-updated", refresh);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const buyers = residueBuyers[residueType] || [];
  const bestBuyer = buyers.length ? [...buyers].sort((a, b) => b.price - a.price)[0] : null;

  // --- ACTIONS ---
  const handleInstantSell = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setConfirmed(true);
    }, 1500);
  };

  const handleListForBid = () => {
    if (!basePrice || basePrice <= 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const allowedBuyerTypes = Array.from(
        new Set((residueBuyers[residueType] || []).map((b) => String(b.type || "").trim()).filter(Boolean)),
      );

      const created = createAuction({
        sellerPhone: profile?.phone || "",
        sellerName: profile?.name || "",
        residueType,
        quantityTons: quantity,
        basePriceTotal: parseFloat(basePrice),
        durationHours: duration === "24h" ? 24 : duration === "3d" ? 72 : 168,
        allowedBuyerTypes,
      });

      const newListing = {
        id: created.id,
        type: residueType,
        quantity: quantity,
        basePrice: parseFloat(basePrice),
        highestBid: null,
        timeRemaining: duration === "24h" ? "23h 59m" : duration === "3d" ? "2d 23h" : "6d 23h",
        bidders: 0,
        status: "active",
        auctionId: created.id,
      };

      setMyListings((prev) => [newListing, ...(prev || [])]);
      setIsProcessing(false);
      setConfirmed(true);
    }, 1500);
  };

  const handleAcceptBid = (auctionId, bidId) => {
    try {
      acceptBid({ auctionId, bidId });
      setMyListings((prev) =>
        (prev || []).map((listing) =>
          listing.auctionId === auctionId || listing.id === auctionId
            ? { ...listing, status: "completed", acceptedBidId: bidId }
            : listing,
        ),
      );
      setConfirmed(false);
    } catch (e) {
      alert(e?.message || "Unable to accept bid.");
    }
  };

  return (
    <PageWrapper>
      <Header
        title={content.waste?.title || "Waste to Wealth"}
        subtitle={content.waste?.subtitle || "Sell crop residue"}
        location={content.locationLabel}
        showBack
        maxWidth="max-w-6xl"
      />

      <div className="relative mx-auto mt-4 max-w-6xl px-5 pb-12 md:px-8">
        <div className="pointer-events-none absolute inset-x-0 -top-14 h-72 bg-gradient-to-r from-emerald-400/20 via-cyan-400/10 to-indigo-500/20 blur-3xl" />

        <div className="relative mb-6 overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">Carbon-smart marketplace</p>
              <h2 className="mt-1 font-display text-3xl font-black text-slate-950">Waste to Wealth Exchange</h2>
              <p className="mt-1.5 text-sm font-semibold text-slate-600">Sell residue instantly or launch a competitive auction with live bids.</p>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <StatPill label="Buyers" value={buyers.length} tone="emerald" />
              <StatPill label="Qty" value={`${quantity}t`} tone="indigo" />
              <StatPill label="CO2" value={`${(quantity * 1.5).toFixed(1)}t`} tone="amber" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-2 rounded-[24px] border border-slate-200/70 bg-white/90 p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => { setActiveTab('new_sell'); setConfirmed(false); }}
            className={[
              "flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition",
              activeTab === "new_sell"
                ? "bg-gradient-to-r from-slate-950 to-slate-800 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            <ShoppingCart size={18} />
            {content.waste?.sellNow || "Sell Residue"}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('my_listings'); setConfirmed(false); }}
            className={[
              "flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition",
              activeTab === "my_listings"
                ? "bg-gradient-to-r from-slate-950 to-slate-800 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            <Gavel size={18} />
            {content.waste?.myActiveBids || "My Listings"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'new_sell' && (
            <motion.div
              key="new_sell"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-5 xl:grid-cols-[1fr_360px]"
            >
              <div className="space-y-5">
                <Card className="rounded-[30px] border border-slate-200/70 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{content.waste?.title || "Waste to Wealth"}</p>
                      <h3 className="mt-1 text-2xl font-black text-slate-950">{content.waste?.residueType || "Select residue"}</h3>
                    </div>
                    <span className="hidden items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700 ring-1 ring-amber-200 sm:inline-flex">
                      <Award size={14} /> Premium market
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <SelectField
                      label={content.waste?.residueType || "Select Residue Type"}
                      value={residueType}
                      onChange={(event) => setResidueType(event.target.value)}
                      options={residueOptions}
                    />
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        {content.waste?.quantityLabel || "Quantity (in Tons)"}
                      </span>
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, (Number(q) || 1) - 1))}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                          className="w-full bg-transparent px-2 py-2 text-center text-sm font-black text-slate-900 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => (Number(q) || 1) + 1)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </label>
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <p className="mb-3 text-sm font-semibold text-slate-700">{content.waste?.chooseMethod || "Choose sale method"}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setSellMethod("instant")}
                        className={[
                          "rounded-2xl border p-4 text-left transition",
                          sellMethod === "instant"
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
                            <ShoppingCart size={18} className={sellMethod === "instant" ? "text-emerald-700" : "text-slate-700"} />
                          </span>
                          <div>
                            <p className="text-sm font-black text-slate-900">Instant Sell</p>
                            <p className="mt-1 text-xs font-semibold text-slate-600">Accept the best corporate offer now.</p>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSellMethod("bid")}
                        className={[
                          "rounded-2xl border p-4 text-left transition",
                          sellMethod === "bid"
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
                            <Gavel size={18} className={sellMethod === "bid" ? "text-indigo-700" : "text-slate-700"} />
                          </span>
                          <div>
                            <p className="text-sm font-black text-slate-900">Auction</p>
                            <p className="mt-1 text-xs font-semibold text-slate-600">Publish lot and accept highest bid.</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </Card>

                {isLoading ? (
                  <LoadingState label={content.waste?.loading || "Loading options..."} />
                ) : confirmed ? (
                  <Card className="overflow-hidden rounded-[30px] border-emerald-800 bg-gradient-to-r from-emerald-900 via-leaf-900 to-slate-900 text-white shadow-xl">
                    <div className="flex items-start gap-4">
                      <CheckCircle2 size={30} className="mt-1 shrink-0 text-emerald-300" />
                      <div className="w-full">
                        <h3 className="text-2xl font-black">{sellMethod === 'instant' ? "Sale Confirmed" : "Listing Published"}</h3>
                        <p className="mt-2 text-sm font-semibold text-emerald-100/90">
                          {sellMethod === 'instant'
                            ? `You agreed to sell ${quantity} tons to ${bestBuyer.name}.`
                            : `Your ${quantity} tons of ${residueOptions.find(o => o.value === residueType)?.label} is now live for bidding.`}
                        </p>
                        <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4">
                          <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Environmental impact</p>
                          <p className="mt-1 text-sm font-bold">Approx. {(quantity * 1.5).toFixed(1)} tons CO2 prevented.</p>
                        </div>
                        <Button className="mt-5 w-full border-none bg-white/15 text-white hover:bg-white/25" onClick={() => { setConfirmed(false); if (sellMethod === 'bid') setActiveTab('my_listings'); }}>
                          {sellMethod === 'instant' ? "Sell More Residue" : "View My Listings"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : sellMethod === "instant" ? (
                  buyers.length ? (
                    <section className="space-y-3">
                      <div className="flex items-end justify-between">
                        <p className="text-sm font-black text-slate-900">Corporate Buyers</p>
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-700">{buyers.length} offers</span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {buyers.map((buyer) => {
                          const isBest = buyer.name === bestBuyer.name;
                          const totalPrice = buyer.price * quantity;
                          return (
                            <Card key={buyer.name} className={`rounded-[26px] border p-5 transition hover:-translate-y-0.5 ${isBest ? "border-amber-200 bg-amber-50/50 ring-1 ring-amber-200/70" : "border-slate-200 bg-white"}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-lg font-black text-slate-900">{buyer.name}</p>
                                    {isBest ? <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase text-white">Top</span> : null}
                                  </div>
                                  <p className="mt-1 text-xs font-semibold text-slate-600">{content.waste?.buyerTypes?.[buyer.type] ?? buyer.type}</p>
                                </div>
                                <p className="text-right text-xl font-black text-slate-900">{formatPrice(totalPrice, content.locale)}</p>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-700"><Clock size={12} /> {buyer.distance}</span>
                                <span className="text-xs font-black text-emerald-700">{formatPrice(buyer.price, content.locale)} / ton</span>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md" onClick={handleInstantSell} disabled={isProcessing || !bestBuyer}>
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
                        {isProcessing ? (content.common?.loading || "Loading...") : bestBuyer ? `Confirm with ${bestBuyer.name}` : "Confirm"}
                      </Button>
                    </section>
                  ) : (
                    <EmptyState icon="♻️" title="No buyers currently" description="Try listing via auction for broader reach." />
                  )
                ) : (
                  <Card className="rounded-[30px] border border-indigo-200/70 bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-black text-slate-900"><Gavel size={18} className="text-indigo-700" /> Auction setup</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-600">Set base price and duration before publishing.</p>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-700 ring-1 ring-indigo-200">B2B</span>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Minimum base price</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="number"
                            placeholder="e.g. 15000"
                            value={basePrice}
                            onChange={(e) => setBasePrice(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-11 pr-4 text-sm font-black text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-slate-500">Auction duration</label>
                        <div className="flex gap-2">
                          {[{ id: "24h", label: "24h" }, { id: "3d", label: "3d" }, { id: "7d", label: "7d" }].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setDuration(opt.id)}
                              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-black ring-1 transition ${duration === opt.id ? "bg-indigo-600 text-white ring-indigo-600" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button className="mt-6 w-full bg-gradient-to-r from-indigo-700 to-violet-700 text-white shadow-md" onClick={handleListForBid} disabled={isProcessing || !basePrice}>
                      {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ListPlus size={20} />}
                      {isProcessing ? "Publishing..." : "Publish listing"}
                    </Button>
                  </Card>
                )}
              </div>

              <div className="space-y-5">
                <Card className="rounded-[30px] border border-slate-200/70 bg-white shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Best offer snapshot</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{bestBuyer ? formatPrice(bestBuyer.price * quantity, content.locale) : "—"}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{bestBuyer ? `For ${quantity} tons` : "Select residue to see offers"}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <MiniKpi icon={DollarSign} label="Per ton" value={bestBuyer ? formatPrice(bestBuyer.price, content.locale) : "—"} />
                    <MiniKpi icon={TrendingUp} label="Buyers" value={String(buyers.length)} />
                  </div>
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-emerald-700"><Leaf size={16} /> <p className="text-xs font-black uppercase tracking-widest">Impact</p></div>
                    <p className="mt-1 text-sm font-semibold text-emerald-800">Approx. {(quantity * 1.5).toFixed(1)} tons CO2 prevented.</p>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'my_listings' && (
            <motion.div
              key="my_listings"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              {myListings.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {myListings.map((listing) => (
                    <Card key={listing.id} className="relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-white shadow-sm">
                      {listing.status === 'completed' && (
                        <div className="absolute inset-0 z-10 grid place-items-center bg-white/70 backdrop-blur-sm">
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-black text-white">
                            <CheckCircle2 size={18} /> Sold
                          </div>
                        </div>
                      )}
                      <div className="mb-4 flex items-start justify-between border-b border-slate-200 pb-4">
                        <div>
                          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">{listing.id}</span>
                          <h3 className="mt-3 text-lg font-black capitalize text-slate-900">{listing.type} Residue</h3>
                          <p className="mt-1 text-xs font-semibold text-slate-600">{listing.quantity} Tons Listed</p>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-amber-700">
                            <Clock size={13} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{listing.timeRemaining}</span>
                          </div>
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">{listing.bidders} Bidders</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Base Price</p>
                            <p className="mt-1 text-lg font-black text-slate-900">₹{listing.basePrice.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600"><TrendingUp size={12} /> Highest</p>
                            <p className={`mt-1 text-xl font-black ${listing.highestBid ? 'text-slate-900' : 'text-slate-400'}`}>
                              {listing.highestBid ? `₹${listing.highestBid.toLocaleString()}` : "No Bids Yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {listing.status === "active" ? (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Received bids</p>
                          {listing.bids?.length ? (
                            <div className="mt-3 space-y-2">
                              {[...(listing.bids || [])]
                                .sort((a, b) => Number(b.amountTotal || 0) - Number(a.amountTotal || 0))
                                .slice(0, 5)
                                .map((b) => (
                                  <div key={b.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-black text-slate-900">₹{Number(b.amountTotal || 0).toLocaleString()}</p>
                                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{b.buyer?.name || b.buyer?.phone || "Buyer"}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleAcceptBid(listing.auctionId || listing.id, b.id)}
                                      className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-800"
                                    >
                                      Accept
                                    </button>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs font-semibold text-slate-600">No bids yet.</p>
                          )}
                        </div>
                      ) : null}
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState icon="📋" title="No Active Bids" description="You haven't listed any residue for auction yet." />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}

function MiniKpi({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-leaf-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-800 ring-1 ring-leaf-100">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-leaf-500">{label}</p>
          <p className="mt-0.5 text-sm font-black text-leaf-900 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, tone }) {
  const toneMap = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };
  const cls = toneMap[tone] || toneMap.emerald;
  return (
    <div className={`rounded-2xl border px-3 py-2 text-center ${cls}`}>
      <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
      <p className="text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}