import { AnimatePresence, motion } from "framer-motion";
import { Award, BadgeCheck, CheckCircle2, CircleDollarSign, Clock, DollarSign, Gavel, Leaf, Loader2, MapPin, ShieldCheck, ShoppingCart, Sparkles, TrendingUp } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
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
import { createEscrowRemote, createLogisticsRemote, createTransactionRemote, listTransactionsRemote, updateTransactionRemote } from "../services/transactionService";
import { createCarbonCertificateRemote, submitDisputeRemote, submitKycRemote } from "../services/complianceService";
import ContractDetailModal from "../components/ContractDetailModal";
import TrustScoreBadge from "../components/TrustScoreBadge";
import AdminDisputeDashboard from "../components/AdminDisputeDashboard";
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
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentStep, setCurrentStep] = useState("escrow_locked");
  const [workflowMessage, setWorkflowMessage] = useState("Escrow is locked and the deal is protected.");
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [kycStatus, setKycStatus] = useState(profile?.kyc_status || "pending");
  const [disputeReason, setDisputeReason] = useState("");
  const [onboardingState, setOnboardingState] = useState("not_started");
  const [carbonCertificate, setCarbonCertificate] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractModalData, setContractModalData] = useState(null);
  const [pickupCode, setPickupCode] = useState("QR-78421");
  const [pickupConfirmed, setPickupConfirmed] = useState(false);

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

  const loadTransactions = useCallback(async () => {
    try {
      const txResponse = await listTransactionsRemote();
      setTransactions(Array.isArray(txResponse?.data) ? txResponse.data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadMyListings();
    loadTransactions();
    setKycStatus(profile?.kyc_status || "pending");
  }, [loadMyListings, loadTransactions, refreshTrigger, profile?.kyc_status]);

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
  const selectedResidueLabel = content.waste?.residueOptions?.[residueType] || residueType;
  const recommendedMode = quantity >= 3 ? "auction" : "instant";
  const estimatedPayout = bestBuyer ? formatPrice(bestBuyer.price * quantity, "en-IN") : "—";
  const farmerJourneySteps = [
    { title: "Choose residue", description: "Pick the waste you want to sell today." },
    { title: "Pick the quickest route", description: recommendedMode === "instant" ? "Instant sale is best for fast cash." : "Auction can increase your return on larger loads." },
    { title: "Track pickup and payout", description: "Escrow, logistics, and carbon credit updates stay in one place." },
  ];

  const handleInstantSell = async () => {
    setIsProcessing(true);
    try {
      const allowedBuyerTypes = [...new Set(buyers.map(b => b.type).filter(Boolean))];
      const auction = await createAuction({
        sellerId: profile?.id,
        sellerPhone: profile?.phone || "",
        sellerName: profile?.name || "",
        residueType,
        quantityTons: quantity,
        basePriceTotal: Number(bestBuyer?.price || 0) * quantity,
        durationHours: 24,
        allowedBuyerTypes,
      });
      await createTransactionRemote({
        id: `TXN-${auction.id}`,
        auctionId: auction.id,
        bidId: `BID-${auction.id}`,
        sellerName: profile?.name || "Seller",
        buyerName: bestBuyer?.name || "Buyer",
        status: "escrow_locked",
      });
      setConfirmed(true);
      setRefreshTrigger(r => r + 1);
    } catch (e) {
      console.error(e);
      alert("Failed to initialize transaction: " + e.message);
    }
    setIsProcessing(false);
  };

  const handleListForBid = async () => {
    if (!basePrice || basePrice <= 0) return;
    setIsProcessing(true);
    try {
      const allowedBuyerTypes = [...new Set(buyers.map(b => b.type).filter(Boolean))];
      const auction = await createAuction({
        sellerId: profile?.id,
        sellerPhone: profile?.phone || "",
        sellerName: profile?.name || "",
        residueType,
        quantityTons: quantity,
        basePriceTotal: parseFloat(basePrice),
        durationHours: duration === "24h" ? 24 : duration === "3d" ? 72 : 168,
        allowedBuyerTypes,
      });
      await createTransactionRemote({
        id: `TXN-${auction.id}`,
        auctionId: auction.id,
        bidId: `BID-${auction.id}`,
        sellerName: profile?.name || "Seller",
        buyerName: "Open Market",
        status: "escrow_locked",
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
      const accepted = await acceptBid({ auctionId, bidId });
      await createTransactionRemote({
        id: `TXN-${auctionId}-${bidId}`,
        auctionId,
        bidId,
        sellerName: profile?.name || "Seller",
        buyerName: accepted?.buyer?.name || "Buyer",
        status: "escrow_locked",
      });
      setRefreshTrigger(r => r + 1);
    } catch (e) { alert(e.message); }
  };

  const handleTransactionAdvance = async (auctionId, bidId, nextStatus) => {
    try {
      const transactionId = transactions.find((item) => item.auctionId === auctionId)?.id || null;
      await updateTransactionRemote({ transactionId, auctionId, bidId, status: nextStatus });
      if (nextStatus === "pickup_scheduled") {
        const logistics = await createLogisticsRemote({ transactionId: transactionId || `${auctionId}-${bidId}`, eventType: "pickup_scheduled", actorName: profile?.name || "Platform", notes: "Pickup scheduled for residue collection." });
        setWorkflowMessage(logistics?.data?.eventType ? "Pickup scheduled and logistics confirmed." : workflowMessage);
      }
      if (nextStatus === "delivered") {
        const logistics = await createLogisticsRemote({ transactionId: transactionId || `${auctionId}-${bidId}`, eventType: "delivered", actorName: profile?.name || "Platform", notes: "Residue delivered and verified." });
        setWorkflowMessage(logistics?.data?.eventType ? "Delivery confirmed and quality verified." : workflowMessage);
      }
      if (nextStatus === "payment_released") {
        const escrowResult = await createEscrowRemote({ transactionId: transactionId || `${auctionId}-${bidId}`, amount: Number(basePrice || 0), currency: "INR", status: "released" });
        setPayoutHistory((prev) => [{ id: escrowResult?.data?.id || `ESC-${Date.now()}`, amount: escrowResult?.data?.amount || Number(basePrice || 0), status: escrowResult?.data?.status || "released" }, ...prev]);
        const carbon = await createCarbonCertificateRemote({ transactionId: transactionId || `${auctionId}-${bidId}`, co2SavedTons: Number(quantity * 1.5), certificateId: `CRT-${Date.now()}`, status: "issued" });
        setCarbonCertificate(carbon?.data || null);
        setWorkflowMessage("Payment released, payout history recorded, and carbon certificate issued.");
      }
      setCurrentStep(nextStatus);
      setRefreshTrigger(r => r + 1);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleKycSubmit = async () => {
    try {
      const result = await submitKycRemote({ userId: profile?.id || "guest", role: profile?.role || "farmer", status: "verified", notes: "Seller verified through platform onboarding" });
      setKycStatus(result?.data?.status || "verified");
      setOnboardingState("verified");
      setWorkflowMessage("KYC and seller verification completed.");
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDisputeSubmit = async () => {
    if (!disputeReason.trim()) return;
    try {
      const result = await submitDisputeRemote({ transactionId: selectedTransaction || "TXN-001", reason: disputeReason, status: "open" });
      setWorkflowMessage(`Dispute raised: ${result?.data?.reason || disputeReason}`);
      setDisputeReason("");
    } catch (e) {
      alert(e.message);
    }
  };

  const handleConfirmPickup = () => {
    setPickupConfirmed(true);
    setWorkflowMessage("Pickup confirmed via QR scan and logistics has been notified.");
    setCurrentStep("delivered");
  };

  const openContractDetails = (listing) => {
    setContractModalData({
      id: listing?.auctionId || listing?.id,
      sellerName: profile?.name || "Farmer",
      buyerName: bestBuyer?.name || "Buyer",
      amount: listing?.basePrice || 0,
    });
    setShowContractModal(true);
  };

  const selectedTransactionData = transactions.find((item) => item.auctionId === selectedTransaction) || null;

  return (
    <PageWrapper>
      <Header title="Waste to Wealth" subtitle="Sell crop residue" location={content.locationLabel} showBack maxWidth="max-w-6xl" />
      <div className="relative mx-auto mt-4 max-w-6xl px-5 pb-12 md:px-8">
        <div className="relative mb-6 overflow-hidden rounded-[32px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6 shadow-sm md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
                <Sparkles size={13} /> Farmer-first residue marketplace
              </div>
              <h2 className="mt-3 font-display text-3xl font-black text-slate-950">Turn farm waste into reliable income</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Pick your residue, compare trusted buyers, protect the deal with escrow, and track pickup from one simple flow.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white">Fast payout options</span>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-700 ring-1 ring-slate-200">Carbon impact tracked</span>
              </div>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-3 lg:min-w-[320px]">
              <StatPill label="Buyers" value={buyers.length} tone="emerald" />
              <StatPill label="Qty" value={`${quantity}t`} tone="indigo" />
              <StatPill label="CO2 Saved" value={`${(quantity * 1.5).toFixed(1)}t`} tone="amber" />
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {farmerJourneySteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-black text-white">{index + 1}</span>
                  {step.title}
                </div>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 flex gap-2 rounded-[24px] border border-slate-200 bg-white/90 p-1.5 shadow-sm">
          <button onClick={() => { setActiveTab('new_sell'); setConfirmed(false); }} className={`flex-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${activeTab === 'new_sell' ? 'bg-slate-950 text-white' : 'text-slate-700'}`}><ShoppingCart size={18} /> Sell Residue</button>
          <button onClick={() => { setActiveTab('my_listings'); setConfirmed(false); loadMyListings(); }} className={`flex-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${activeTab === 'my_listings' ? 'bg-slate-950 text-white' : 'text-slate-700'}`}><Gavel size={18} /> My Listings</button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'new_sell' && (
            <motion.div key="new_sell" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-5 xl:grid-cols-[1.15fr_360px]">
              <div className="space-y-5">
                <Card className="rounded-[30px] border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Quick setup</p>
                      <h3 className="text-2xl font-black text-slate-950">Choose what to sell</h3>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700"><Award size={14} /> Premium market</span>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <SelectField label="Residue Type" value={residueType} onChange={e => setResidueType(e.target.value)} options={residueOptions} />
                    <div>
                      <span className="mb-2 block text-sm font-semibold text-slate-700">Quantity (Tons)</span>
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                        <button onClick={() => setQuantity(Math.max(1, quantity-1))} className="h-10 w-10 rounded-xl bg-white ring-1 ring-slate-200">-</button>
                        <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 1)} className="w-full text-center font-black outline-none bg-transparent" />
                        <button onClick={() => setQuantity(quantity+1)} className="h-10 w-10 rounded-xl bg-white ring-1 ring-slate-200">+</button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-emerald-600 p-2 text-white"><BadgeCheck size={16} /></div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Recommended path</p>
                        <p className="mt-1 text-sm text-slate-700">
                          {recommendedMode === "instant"
                            ? `Instant sale is best for ${selectedResidueLabel} when you need quick cash.`
                            : `Auction is recommended for larger ${selectedResidueLabel} loads because buyers can compete for better value.`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Sale method</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button onClick={() => setSellMethod("instant")} className={`rounded-2xl border p-4 text-left transition ${sellMethod === "instant" ? "border-emerald-300 bg-emerald-50" : "bg-white"}`}>
                        <div className="flex items-start gap-3"><ShoppingCart size={18} className="text-emerald-700" /><div><p className="font-black text-slate-900">Instant Sell</p><p className="text-xs text-slate-600">Accept the best offer now</p></div></div>
                      </button>
                      <button onClick={() => setSellMethod("bid")} className={`rounded-2xl border p-4 text-left ${sellMethod === "bid" ? "border-indigo-300 bg-indigo-50" : "bg-white"}`}>
                        <div className="flex gap-3"><Gavel size={18} className="text-indigo-700" /><div><p className="font-black text-slate-900">Auction</p><p className="text-xs text-slate-600">Let buyers compete</p></div></div>
                      </button>
                    </div>
                  </div>
                </Card>

                {confirmed ? (
                  <Card className="rounded-[30px] bg-gradient-to-r from-emerald-900 to-slate-900 text-white shadow-sm">
                    <div className="flex items-start gap-4"><CheckCircle2 size={30} /><div><h3 className="text-2xl font-black">Marketplace deal initialized</h3><p className="mt-1 text-sm text-emerald-50">Your {quantity} tons of {selectedResidueLabel} are now protected by escrow and tracked end-to-end.</p><div className="mt-4 rounded-2xl bg-white/10 p-4"><p className="text-xs font-black uppercase tracking-[0.2em]">CO2 prevented</p><p className="text-sm font-bold">{(quantity * 1.5).toFixed(1)} tons</p></div><Button className="mt-5 bg-white/20" onClick={() => { setActiveTab('my_listings'); loadMyListings(); }}>View my listings</Button></div></div>
                  </Card>
                ) : sellMethod === "instant" ? (
                  buyers.length ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-slate-900">Trusted buyer offers</p>
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-700">{buyers.length} offers</span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {buyers.map(buyer => <InstantBuyerCard key={buyer.name} buyer={buyer} quantity={quantity} isBest={buyer.name === bestBuyer?.name} />)}
                      </div>
                      <Button className="w-full bg-emerald-700 text-white" onClick={handleInstantSell} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin" /> : <>Confirm with {bestBuyer?.name}</>}</Button>
                    </div>
                  ) : <EmptyState icon="♻️" title="No buyers" description="Try auction method for better reach." />
                ) : (
                  <Card className="rounded-[30px] border border-slate-200 bg-white">
                    <div className="flex justify-between"><h3 className="flex items-center gap-2 text-lg font-black text-slate-900"><Gavel size={18} /> Auction setup</h3><span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-black text-indigo-700">B2B</span></div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div><label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Base price (₹)</label><input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4" placeholder="e.g. 15000" /></div>
                      <div><label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Duration</label><div className="mt-2 flex gap-2">{["24h","3d","7d"].map(opt => <button key={opt} onClick={() => setDuration(opt)} className={`flex-1 rounded-xl py-3 text-sm font-black ${duration === opt ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{opt}</button>)}</div></div>
                    </div>
                    <Button className="mt-6 w-full bg-indigo-700 text-white" onClick={handleListForBid} disabled={isProcessing || !basePrice}>{isProcessing ? <Loader2 className="animate-spin" /> : <>Publish auction</>}</Button>
                  </Card>
                )}
              </div>
              <div className="space-y-5">
                <Card className="rounded-[30px] border border-slate-200 bg-white shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Expected payout</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{estimatedPayout}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <MiniKpi icon={CircleDollarSign} label="Per ton" value={bestBuyer ? formatPrice(bestBuyer.price, "en-IN") : "—"} />
                    <MiniKpi icon={TrendingUp} label="Buyers" value={String(buyers.length)} />
                  </div>
                  <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-emerald-700"><Leaf size={16} /><p className="text-xs font-black uppercase tracking-[0.2em]">Impact</p></div>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{(quantity * 1.5).toFixed(1)} tons CO₂ prevented</p>
                  </div>
                  <div className="mt-4"><TrustScoreBadge score={92} label="Buyer trust" /></div>
                </Card>
                <Card className="rounded-[30px] border border-slate-200 bg-white shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">What happens next</p>
                  <div className="mt-3 space-y-2">
                    {[
                      { key: "escrow_locked", label: "Escrow locked" },
                      { key: "pickup_scheduled", label: "Pickup scheduled" },
                      { key: "in_transit", label: "In transit" },
                      { key: "delivered", label: "Delivered" },
                      { key: "payment_released", label: "Payment released" },
                    ].map((step) => (
                      <button key={step.key} onClick={() => setCurrentStep(step.key)} className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-sm font-semibold ${currentStep === step.key ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "bg-white text-slate-700"}`}>
                        <span>{step.label}</span>
                        {currentStep === step.key ? <CheckCircle2 size={16} /> : null}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{workflowMessage}</div>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Seller protection</p>
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                      <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-600" /><span>KYC</span></div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${kycStatus === "verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{kycStatus}</span>
                    </div>
                    <Button className="mt-3 w-full bg-slate-900 text-white" onClick={handleKycSubmit}>Submit seller verification</Button>
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Dispute resolution</p>
                    <textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm" placeholder="Describe quality or pickup issue" />
                    <Button className="mt-3 w-full bg-amber-600 text-white" onClick={handleDisputeSubmit}>Raise dispute</Button>
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Logistics</p>
                    <div className="mt-2 rounded-xl bg-white px-3 py-2 text-sm">
                      <p className="font-semibold">Partner status: {onboardingState === "verified" ? "Approved" : "Pending"}</p>
                      <p className="mt-1 text-slate-600">Pickup partner can be assigned from this flow.</p>
                    </div>
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">QR pickup</p>
                      <p className="mt-2 rounded-xl bg-slate-100 px-3 py-2 font-black">{pickupCode}</p>
                      <button onClick={handleConfirmPickup} className="mt-3 w-full rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-black text-white">Confirm pickup via QR</button>
                      {pickupConfirmed ? <p className="mt-2 text-sm text-emerald-700">Pickup confirmed</p> : null}
                    </div>
                  </div>
                  {carbonCertificate ? (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Carbon credit</p>
                      <p className="mt-2 text-sm font-semibold">Certificate: {carbonCertificate.certificateId}</p>
                      <p className="text-sm text-slate-700">CO₂ saved: {carbonCertificate.co2SavedTons} tons</p>
                    </div>
                  ) : null}
                  {payoutHistory.length ? (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Payout history</p>
                      {payoutHistory.map((entry) => (
                        <div key={entry.id} className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                          <span>₹{Number(entry.amount || 0).toLocaleString()}</span>
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">{entry.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'my_listings' && (
            <motion.div key="my_listings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {isLoading ? <LoadingState /> : myListings.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {myListings.map(listing => (
                    <Card key={listing.id} className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
                      {listing.status === 'completed' && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center"><div className="rounded-full bg-slate-900 px-5 py-2 text-white text-sm font-black">SOLD</div></div>}
                      <div className="flex justify-between border-b border-slate-200 pb-4"><div><span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-700">{listing.id.slice(-8)}</span><h3 className="mt-2 text-lg font-black capitalize text-slate-950">{listing.type}</h3><p className="text-sm text-slate-600">{listing.quantity} Tons</p></div><div className="text-right"><span className="inline-flex gap-1 rounded bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700"><Clock size={12} /> {listing.timeRemaining}</span><p className="mt-1 text-[10px] font-black text-slate-700">{listing.bidders} Bidders</p></div></div>
                      <div className="my-4 rounded-2xl bg-slate-50 p-4"><div className="flex justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Base price</p><p className="text-lg font-black text-slate-950">₹{listing.basePrice.toLocaleString()}</p></div><div className="text-right"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Highest bid</p><p className="text-xl font-black text-slate-950">{listing.highestBid ? `₹${listing.highestBid.toLocaleString()}` : "—"}</p></div></div></div>
                      {listing.status === "active" && listing.bids?.length > 0 && (
                        <div className="mt-2 rounded-2xl border border-slate-200 p-4"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Received bids</p><div className="mt-3 space-y-2">{listing.bids.sort((a,b)=>b.amountTotal-a.amountTotal).slice(0,3).map(bid => <div key={bid.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><div><p className="font-black text-slate-950">₹{bid.amountTotal.toLocaleString()}</p><p className="text-[10px] text-slate-500">{bid.buyer?.name || "Buyer"}</p></div><button onClick={() => handleAcceptBid(listing.auctionId, bid.id)} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white">Accept</button></div>)}</div></div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => { setSelectedTransaction(listing.auctionId); setCurrentStep("escrow_locked"); }} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">Open contract</button>
                        <button onClick={() => openContractDetails(listing)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">Contract details</button>
                        <button onClick={() => handleTransactionAdvance(listing.auctionId, listing.id, "pickup_scheduled")} className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-black text-white">Schedule pickup</button>
                        <button onClick={() => handleTransactionAdvance(listing.auctionId, listing.id, "payment_released")} className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-black text-white">Release payment</button>
                      </div>
                      {selectedTransaction === listing.auctionId && selectedTransactionData && (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live contract</p>
                          <p className="mt-2 font-semibold text-slate-900">Status: {selectedTransactionData.status || currentStep}</p>
                          <p className="mt-1 text-slate-600">Seller: {selectedTransactionData.sellerName || profile?.name || "—"}</p>
                          <p className="text-slate-600">Buyer: {selectedTransactionData.buyerName || "—"}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : <EmptyState icon="📋" title="No active bids" description="List your residue to start receiving bids." />}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-6">
          <AdminDisputeDashboard />
        </div>
      </div>
      {showContractModal ? <ContractDetailModal contract={contractModalData} onClose={() => setShowContractModal(false)} /> : null}
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
